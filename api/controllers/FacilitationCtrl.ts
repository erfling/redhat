import { Router, Request, Response, NextFunction } from "express";
import ResponseModel, {
  ResponseFetcher
} from "../../shared/models/ResponseModel";
import SapienServerCom from "../../shared/base-sapien/client/SapienServerCom";
import { AppServer } from "../AppServer";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";
import SchemaBuilder from "../SchemaBuilder";
import * as mongoose from "mongoose";
import GameModel from "../../shared/models/GameModel";
import FacilitationRoundResponseMapping from "../../shared/models/FacilitationRoundResponseMapping";
import { monGameModel } from "./GameCtrl";
import SubRoundModel from "../../shared/models/SubRoundModel";
import { monSubRoundModel, monQModel, monRoundModel } from "./RoundCtrl";
import { monResponseModel } from "./GamePlayCtrl";
import TeamModel from "../../shared/models/TeamModel";
import QuestionModel, {
  ComparisonLabel,
  RatingType
} from "../../shared/models/QuestionModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import { monTeamModel } from "./TeamCtrl";
import SubRoundScore from "../../shared/models/SubRoundScore";
import GamePlayUtils from "../GamePlayUtils";
import RoundModel from "../../shared/models/RoundModel";
import { GamePlayRouter } from "./GamePlayCtrl";
import ValueObj, {
  SliderValueObj
} from "../../shared/entity-of-the-state/ValueObj";

const schObj = SchemaBuilder.fetchSchema(RoundChangeLookup);
const monRoundChangeLookupSchema = new mongoose.Schema(schObj);
export const monRoundChangeLookupModel = mongoose.model(
  "roundchangelookup",
  monRoundChangeLookupSchema
);

class FacilitationCtrl {
  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  public router: Router;
  public GameModel: any;

  //----------------------------------------------------------------------
  //
  //  Constructor
  //
  //----------------------------------------------------------------------

  constructor() {
    this.router = Router({ mergeParams: true });
    this.routes();

    //console.log("monSchema:", monRoundModel);
  }

  //----------------------------------------------------------------------
  //
  //  Event Handlers
  //
  //----------------------------------------------------------------------

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  public async GetRounds(req: Request, res: Response): Promise<any> {
    console.log("CALLING GET ROUNDS");
  }

  public async ChangeRound(req: Request, res: Response): Promise<any> {
    const id = req.params.id;

    AppServer.LongPoll.publish(
      SapienServerCom.BASE_REST_URL + "/gameplay/listenforgameadvance/" + id,
      "hello"
    );
    res.json("yo");
  }

  public async getRoundChangeLookups(req: Request, res: Response) {
    try {
      const lookups = await monRoundChangeLookupModel
        .find() /*.populate("Round").populate("SubRound")*/
        .then(lookups =>
          lookups
            ? lookups.map(l =>
                Object.assign(new RoundChangeLookup(), l.toJSON())
              )
            : null
        );

      if (!lookups) throw new Error();

      res.json(lookups);
    } catch (err) {
      res.status(500).send("Can't get it");
    }
  }

  public async GetTeamResponsesByRound(req: Request, res: Response) {}

  public async GetTeamsFinished(req: Request, res: Response) {
    try {
      let GameId = req.params.gameid;

      let game: GameModel = await monGameModel
        .findById(GameId)
        .populate("Facilitator")
        .populate({
          path: "Teams",
          populate: {
            path: "Players"
          }
        })
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      if (!game) throw new Error("Failed to retrieve game");

      let subRound: SubRoundModel = await monSubRoundModel
        .findOne({ Name: game.CurrentRound.ChildRound.toUpperCase() })
        .populate("Questions")
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );
      if (!subRound) throw new Error("Failed to retrieve subround");

      let responses: ResponseModel[] = await monResponseModel
        .find({ GameId, SubRoundId: subRound._id })
        .then(rs =>
          rs
            ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON()))
            : null
        );
      if (!responses) throw new Error("Failed to retrieve responses");

      //grab team rating questions for special cases. Faster to do up here than in loop below
      let ratingQuestions = await monQModel
        .find({ RatingMarker: RatingType.TEAM_RATING })
        .then(qs =>
          qs
            ? qs.map(q => Object.assign(new QuestionModel(), q.toJSON()))
            : null
        );

      let mappings: FacilitationRoundResponseMapping[] = [];
      game.Teams.forEach(t => {
        t = Object.assign(new TeamModel(), t);
        let teamResponses = responses.filter(r => r.TeamId == t._id.toString());

        let m = new FacilitationRoundResponseMapping();
        m.TeamId = t._id;
        m.TeamName = "Team " + t.Number.toString();
        m.SubRoundId = subRound._id;
        m.SubRoundLabel = subRound.Label;
        m.SubRoundName = subRound.Name;
        m.GameId = game._id.toString();
        m.IsComplete = true;

        if (
          !game.CurrentRound.ShowRateUsers &&
          !game.CurrentRound.ShowIndividualFeedback
        ) {
          let isRating = false;

          //round 2A is a special case
          if (game.CurrentRound.ChildRound.toUpperCase() == "DEALSTRUCTURE") {
            m.Questions = subRound.Questions.filter(
              q =>
                q.ComparisonLabel &&
                q.ComparisonLabel == ComparisonLabel.QUANTITY
            );
          } else if (
            game.CurrentRound.ChildRound.toUpperCase() == "TEAMRATING" ||
            game.CurrentRound.ChildRound.toUpperCase() == "DEALRENEWAL"
          ) {
            m.Questions = ratingQuestions;
            isRating = true;

            console.log("RATING QUESTIONS HAVE BEEN FOUND FOR SUBROUND", game.CurrentRound.ChildRound.toUpperCase())
          } else {
            m.Questions = subRound.Questions;
          }

          m.Questions = m.Questions.map(q => {
            let response = teamResponses.filter(r => r.QuestionId == q._id);

            let question = Object.assign(new QuestionModel(), q, {
              Response:
                response.length && response[0].Answer ? response[0] : null
            });

            //if we are doing rating questions, we must assure that each team has rated each other team
            if (isRating) {
                console.log("THIS IS A RATINGS ROUND", response.length, game.Teams.length)
              //let otherTeamIds: string[] = game.Teams.filter(team => t._id != team._id).map(team => team._id.toString());
              if (response.length < game.Teams.length - 1) m.IsComplete = false;
            }
            //for non-rating rounds, just assure that we have a response from the current team
            else if (!question.Response) m.IsComplete = false;

            return question;
          });
        } else {
          //Lf: whats mgr for if mgr is checked below in t.players iterator?
          let mgr: UserModel = t.Players.filter(
            p => game.CurrentRound.UserJobs[p._id] == JobName.MANAGER
          )[0];

          //lf: likewise, why another iteration if mgr status is checked below in t.players loop?

          let nonManagers = t.Players.filter(
            p =>
              !game.CurrentRound.UserJobs[p._id] ||
              game.CurrentRound.UserJobs[p._id] != JobName.MANAGER
          );

          //check to see if each non-manager player has been rated
          t.Players.forEach(p => {
            p = Object.assign(new UserModel(), p);
            let isManager: boolean =
              game.CurrentRound.UserJobs[p._id] &&
              game.CurrentRound.UserJobs[p._id] == JobName.MANAGER;

            if (!isManager) {
              let filteredRatings = responses.filter(
                r => r.targetObjId == p._id
              );

              let rating = Object.assign(
                filteredRatings.length
                  ? filteredRatings[0]
                  : new ResponseModel(),
                {
                  IsComplete: false,
                  targetObjName: p.targetObjName,
                  targetObjId: p._id
                }
              );

              rating.IsComplete = filteredRatings.length > 0;

              rating.targetObjName = p.Name;

              m.RatingsByManager.push(rating);
            }
            //have all players rated the manager
          });

          nonManagers.forEach((u, i) => {
            let filteredRatings = responses.filter(r => r.UserId == u._id);
            u = Object.assign(new UserModel(), u);
            let rating = Object.assign(
              filteredRatings.length ? filteredRatings[0] : new ResponseModel(),
              {
                IsComplete: filteredRatings.length != 0,
                targetObjName: u.Name,
                targetObjId: u._id
              }
            );
            m.RatingsOfManager.push(rating);
          });
          //Round is only complete if all players have been rated appriopriately.
          m.IsComplete =
            m.RatingsByManager.every(r => r.IsComplete) &&
            m.RatingsOfManager.every(r => r.IsComplete);
        }

        //go thru all players and push their data to team view object

        t.Players.forEach((teamMember, i) => {
          teamMember.Job =
            game.CurrentRound.UserJobs[teamMember._id] || JobName.IC;
          m.Members.push(teamMember);
        });

        m.CurrentRound = game.CurrentRound;

        mappings.push(m);
      });

      res.json(mappings);
    } catch (err) {
      res.status(500).send("Error");
    }
  }

  public async getTeamResponses(req, res) {
    const { TeamId } = req.params;
    try {
      console.log("this got called");
      let responses: ResponseModel[] = await monResponseModel
        .find({ TeamId })
        .then(rs => (rs ? rs.map(r => r.toJSON()) : null));

      const subRounds: SubRoundModel[] = await monSubRoundModel
        .find()
        .then(srs => srs.map(sr => sr.toJSON() as SubRoundModel));

      const team = await monTeamModel.findById(TeamId).then(t => t.toJSON());
      const game = (await monGameModel
        .findById(team.GameId)
        .populate({
          path: "Teams",
          populate: {
            path: "Players"
          }
        })
        .then(g => g.toJSON())) as GameModel;
      const teams = game.Teams;

      if (!responses || !responses.length) throw new Error("bad");

      const questions: QuestionModel[] = await monQModel
        .find()
        .then(qs => (qs ? qs.map(q => q.toJSON()) : null));
      if (!questions || !questions.length) throw new Error("bad");

      //get the possible answer matching our response
      responses = responses.map(response => {
        const question: QuestionModel = questions.find(
          q => q._id == response.QuestionId
        );

        if (!question) {
          return response;
        }

        //pack all answers into a single response for team ratings
        if (question.RatingMarker == RatingType.TEAM_RATING) {
          let allRelevantResponses = responses.filter(r => {
            return r.QuestionId == response.QuestionId;
          });

          let answers = allRelevantResponses.map(r => {
            console.log("ID OF RESPONSE", r._id);
            (r.Answer as SliderValueObj[]).forEach(a => {
              let sr = subRounds.find(sr => sr._id == r.SubRoundId);
              let team = teams.find(t => t._id == r.targetObjId);

              if (sr) a.SubRoundLabel = sr.Label;
              if (team) a.TeamLabel = team.Number.toString();
            });
            return r.Answer;
          });

          (response.Answer as any) = answers;
        }

        if (
          question.RatingMarker == RatingType.IC_RATING ||
          question.RatingMarker == RatingType.MANAGER_RATING
        ) {
          let allRelevantResponses = responses.filter(r => {
            return r.QuestionId == response.QuestionId;
          });

          let answers = allRelevantResponses.map(r => {
            let team = teams.find(t => t._id == r.TeamId);
            let sr = subRounds.find(sr => sr._id == r.SubRoundId);
            let submittingUser = team.Players.find(p => p._id == r.UserId);
            let targetUser = team.Players.find(p => p._id == r.targetObjId);

            (r.Answer as SliderValueObj[]).forEach(a => {
              if (submittingUser)
                a.SubmitterLabel = submittingUser.LastName
                  ? submittingUser.FirstName + " " + submittingUser.LastName
                  : submittingUser.FirstName;
              if (targetUser)
                a.TargetUserLabel = targetUser.LastName
                  ? targetUser.FirstName + " " + targetUser.LastName
                  : targetUser.FirstName;
              if (sr) a.SubRoundLabel = sr.Label;
              if (team) a.TeamLabel = team.Number.toString();
            });
            return r.Answer;
          });

          (response.Answer as any) = answers;
        }

        const OneAResponse = responses
          .filter(r => !r.SiblingQuestionId)
          .find(r => {
            return response.SiblingQuestionId == r.QuestionId;
          });
        if (!OneAResponse) return response;
        console.log("found a response");

        // for each of question's possibleAnswers (which are the candidates for the job)...
        question.PossibleAnswers.forEach(pa => {
          var skillScore = 0;
          // for each candidate's data (which maps which skills they're best at)
          if (pa.data && Array.isArray(pa.data)) {
            (pa.data as any[]).forEach(paData => {
              if (paData.data != undefined && !isNaN(paData.data)) {
                // find what index the skill was ranked in 1a's response
                var OneAPriorityIndex = (OneAResponse.Answer as ValueObj[]).findIndex(
                  ans => ans.label == paData.label
                );

                //console.log("PRIORITY FOUND AT", OneAPriorityIndex)

                if (OneAPriorityIndex > -1) {
                  // Add to candidate's skill score according to skill priority provided in 1a.
                  // So, the 1st priority has a skill score of the number of priorities (7), the 2nd has a skill score of number of priorities - 1 (6), etc.
                  skillScore +=
                    paData.data *
                    ((OneAResponse.Answer as ValueObj[]).length -
                      OneAPriorityIndex);
                }
              }
            });
            pa["skillScore"] = skillScore;
            //console.log("LOOK FOR SKILLSCORE", skillScore, pa)
          } else {
            console.log("DOOKIE:", pa);
          }
        });

        //sort the possible answers by skillScore so we can see how good the team's choice is
        let sortedPas = question.PossibleAnswers.sort((a, b) => {
          //return 1;
          return a["skillScore"] > b["skillScore"] ? 1 : 0;
        });

        const rightAnswer = sortedPas[sortedPas.length - 1];

        (response.Answer as ValueObj[]).forEach(ans => {
          ans.idealValue = rightAnswer.label;
          ans.maxPoints = 2;
          ans.minPoints = 0;
        });

        return response;
      });

      const finalQs: QuestionModel[] = questions.map(q => {
        q.Response = responses.find(r => r.QuestionId == q._id);
        let sr = subRounds.find(
          sr =>
            sr._id == q.SubRoundId ||
            (q.Response && q.Response.SubRoundId == sr._id)
        );
        if (sr) q.SubRoundLabel = sr.Label;
        return q;
      }); //.filter(q => q.RatingMarker == RatingType.TEAM_RATING)

      res.json(finalQs);
    } catch (error) {
      console.log(error);
      res.send("couldn't get responses");
    }
  }

  public async GoToNext(req: Request, res: Response) {
    let limitrecords = 10;

    function getRandomArbitrary(min, max) {
      return Math.ceil(Math.random() * (max - min) + min);
    }

    let random = monRoundChangeLookupModel.count({}, (err, count) => {
      var skipRecords = getRandomArbitrary(1, count - limitrecords);

      monRoundChangeLookupModel
        .findOne()
        .skip(skipRecords)
        .exec(function(err, result) {
          // Tada! random user
          console.log(result);
        });
    });
  }

  public async GetTeamScoresBySubRound(req: Request, res: Response) {
    try {
      let teamId = req.params.teamId;

      let team: TeamModel = await monTeamModel
        .findById(teamId)
        .then(
          r =>
            GamePlayUtils.InstantiateModelFromDbCall(r, TeamModel) as TeamModel
        );
      if (!team) throw new Error("bad team id");

      let game: GameModel = await monGameModel
        .findById(team.GameId)
        .then(
          r =>
            GamePlayUtils.InstantiateModelFromDbCall(r, GameModel) as GameModel
        );
      if (!game) throw new Error("no game found");

      let mapping = game.CurrentRound;

      let subRounds: SubRoundModel[] = await monSubRoundModel
        .find()
        .then(
          r =>
            GamePlayUtils.InstantiateModelFromDbCall(
              r,
              SubRoundModel
            ) as SubRoundModel[]
        );
      if (!subRounds) throw new Error("No SubRounds");
      let subRound = subRounds.filter(
        sr => sr.Name.toUpperCase() == mapping.ChildRound.toUpperCase()
      )[0];
      if (!subRound) throw new Error("no match for subround");

      let round: RoundModel = await monRoundModel
        .find({})
        .then(
          r =>
            GamePlayUtils.InstantiateModelFromDbCall(
              r,
              RoundModel
            ) as RoundModel
        );

      const responses: ResponseModel[] = await monResponseModel
        .find({ targetObjId: team._id, SubRoundId: subRound._id })
        .then(rs =>
          rs
            ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON()))
            : null
        );
      let questions = subRound.Questions;

      //get TEAM_RATING questions. They will be filtered out by rounds that don't have them, since there is no response
      let ratingQuestions = await monQModel
        .find({ RatingMarker: RatingType.TEAM_RATING })
        .then(qs =>
          qs
            ? qs.map(q =>
                Object.assign(new QuestionModel(), q.toJSON(), {
                  SkipScoring: true
                })
              )
            : null
        );
      questions = questions.concat(ratingQuestions);

      let srs: SubRoundScore = GamePlayUtils.HandleScores(
        questions,
        responses,
        game,
        team,
        round,
        subRound
      );

      res.json(srs);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  public async GetScores(req: Request, res: Response) {
    try {
      const game: GameModel = await monGameModel
        .findById(req.params.gameId)
        .then(
          r =>
            GamePlayUtils.InstantiateModelFromDbCall(r, GameModel) as GameModel
        );

      if (!game) throw new Error("failed to get game");

      console.log("GAME FOUND");

      const scores = await GamePlayUtils.getScoresForGame(game);
      if (!scores) throw new Error("failed to get scores");

      //get the subroundscores from all subrounds. Calling the GamePlayUtils method makes sure they all exist
      req.params.gameid = game._id;
      req.params.subroundid = game.CurrentRound.ChildRound.toUpperCase();
      await GamePlayRouter.getSubRoundScores(req, res);

      //res.json(scores);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public routes() {
    this.router.post("/round/:gameid", this.ChangeRound.bind(this));
    this.router.get(
      "/getroundchangelookups",
      this.getRoundChangeLookups.bind(this)
    );
    this.router.get(
      "/getroundstatus/:gameid",
      this.GetTeamsFinished.bind(this)
    );
    this.router.get("/getscores/:gameId", this.GetScores);
    this.router.get("/getteamresponses/:TeamId", this.getTeamResponses);
  }
}

export default new FacilitationCtrl().router;
