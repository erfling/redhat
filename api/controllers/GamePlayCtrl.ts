import { Slider } from "react-semantic-ui-range";
import { monUserModel } from "./UserCtrl";
import { Router, Request, Response, NextFunction } from "express";
import * as mongoose from "mongoose";
import SchemaBuilder from "../SchemaBuilder";
import ResponseModel, {
  ResponseFetcher
} from "../../shared/models/ResponseModel";
import { monTeamModel } from "./TeamCtrl";
import ValueObj, {
  SliderValueObj
} from "../../shared/entity-of-the-state/ValueObj";
import { monQModel, monSubRoundModel, monRoundModel } from "./RoundCtrl";
import SubRoundModel from "../../shared/models/SubRoundModel";
import { monGameModel, monMappingModel } from "./GameCtrl";
import TeamModel from "../../shared/models/TeamModel";
import GameModel from "../../shared/models/GameModel";
import QuestionModel, {
  QuestionType,
  ComparisonLabel
} from "../../shared/models/QuestionModel";
import { groupBy } from "lodash";
import UserModel, { JobName } from "../../shared/models/UserModel";
import FeedBackModel from "../../shared/models/FeedBackModel";
import { ValueDemomination } from "../../shared/models/SubRoundFeedback";
import { RatingType } from "../../shared/models/QuestionModel";
import SubRoundScore from "../../shared/models/SubRoundScore";
import { AppServer } from "../AppServer";
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import RoundModel from "../../shared/models/RoundModel";
import { text } from "body-parser";

const schObj = SchemaBuilder.fetchSchema(ResponseModel);
const monSchema = new mongoose.Schema(schObj);
export const monResponseModel = mongoose.model("response", monSchema);

const subRoundScoreSchema = SchemaBuilder.fetchSchema(SubRoundScore);
const monSubRoundScoreSchema = new mongoose.Schema(subRoundScoreSchema);
export const monSubRoundScoreModel = mongoose.model(
  "subroundscore",
  monSubRoundScoreSchema
);

export class GamePlayRouter {
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

    //TODO: figure out why AppServer import is undefined unless we wait a tick????????????
    setTimeout(() => {
      this.routes();
    }, 1);
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

    try {
      let rounds = await monTeamModel.find().populate("Players");
      if (!rounds) {
        return res.status(400).json({ error: "No games" });
      } else {
        const status = res.status;
        return res.json(rounds);
      }
    } catch (err) {
      console.log("ERROR", err);
      (err: any) => res.status(500).json({ error: err });
    }
  }

  public async GetRound(req: Request, res: Response): Promise<any> {
    const ID = req.params.round;
    console.log("TRYING TO GET ROUND WITH NAME: ", ID);
    try {
      let round = await monTeamModel.findOne({ Name: ID });
      if (!round) {
        res.status(400).json({ error: "No round" });
      } else {
        res.json(round);
      }
    } catch (err) {
      (err: any) => res.status(500).json({ error: err });
    }
  }

  public async SaveResponse(req: Request, res: Response) {
    const response: ResponseModel = Object.assign(
      new ResponseModel(),
      req.body as ResponseModel
    );

    try {
      const question = await monQModel
        .findById(response.QuestionId)
        .then(q => q.toJSON());
      if (!response.SkipScoring) {
        if (question.Type != QuestionType.TEXTAREA) {
          response.Score = response.resolveScore();
          response.MaxScore = response.resolveMaxScore();
        }
      }

      let queryObj: any = {
        GameId: response.GameId,
        TeamId: response.TeamId,
        QuestionId: response.QuestionId,
        targetObjId: response.targetObjId,
        SubRoundId: response.SubRoundId
      };

      if (response.TargetTeamId) {
        queryObj.TargetTeamId = response.TargetTeamId;
        queryObj.targetObjId = response.TargetTeamId;
      }
      if (response.TargetUserId) queryObj.TargetUserId = response.TargetUserId;

      console.log("TEAM ID:", queryObj.TeamId);

      const oldResponse = await monResponseModel
        .findOne(queryObj)
        .then(r => (r ? r.toJSON() : null));

      if (!oldResponse) {
        console.log("DIDN'T FIND OLD RESPONSE");
        delete response._id;
        response.questionText = question.Text;
        var SaveResponse = await monResponseModel
          .create(response)
          .then(r => r.toObject() as ResponseModel);
      } else {
        console.log("FOUND OLD RESPONSE");
        delete response._id;
        var SaveResponse = await monResponseModel
          .findOneAndUpdate(queryObj, response, { new: true })
          .then(r => r.toObject() as ResponseModel);
      }
      console.log();
      if (!SaveResponse) throw new Error();
      res.json(SaveResponse);
    } catch (err) {
      console.log("ERROR SAVING RESPONSE", err);
      res.status(500);
      res.send("response not saved");
    }
  }

  public async SaveSocialResponse(req: Request, res: Response) {
    try {
      let responseToSave: ResponseModel = Object.assign(
        new ResponseModel(),
        req.body
      ) as ResponseModel;
      responseToSave.Score = responseToSave.resolveScore();
      responseToSave.MaxScore = responseToSave.resolveMaxScore();

      console.log("TRYING TO SAVE SOCIAL RESPONSE:", responseToSave);

      if (!responseToSave) throw new Error("no body");

      //see if we already have a response for this guy
      let savedResponse: ResponseModel = await monResponseModel
        .findOneAndUpdate(
          {
            SubRoundId: responseToSave.SubRoundId,
            QuestionId: responseToSave.QuestionId,
            targetObjId: responseToSave.targetObjId,
            GameId: responseToSave.GameId,
            TeamId: responseToSave.TeamId
          },
          responseToSave,
          { upsert: true, new: true }
        )
        .then(r => (r ? Object.assign(new ResponseModel(), r.toJSON()) : null));

      //consider using upsert, like so:      let savedResponse: ResponseModel;

      /*
    //find the relevant RoundChangeCapping so jobs are preserved if rounds change
    let rcm: RoundChangeMapping = await monMappingModel.findOneAndUpdate(
        {GameId: game._id.toString(), ParentRound: CurrentRound.ParentRound, ChildRound: CurrentRound.ChildRound}, 
        {UserJobs: CurrentRound.UserJobs},
        {upsert: true, new: true}
    ).then(rcm => rcm ? Object.assign(new RoundChangeMapping(), rcm.toJSON()) : null) 

      if (oldResponse) {
        console.log("FOUND OLD SOCIAL RESPONSE:", oldResponse);

        savedResponse = await monResponseModel
          .findByIdAndUpdate(oldResponse._id, responseToSave)
          .then(r => Object.assign(new ResponseModel(), r.toJSON()));
      } else {
        savedResponse = await monResponseModel
          .create(responseToSave)
          .then(r => Object.assign(new ResponseModel(), r.toJSON()));
      }*/

      res.json(savedResponse);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error saving");
    }
  }

  //Special case, since 1b responses depend on 1A responses
  public async Save1BResponse(req: Request, res: Response, next) {
    const response: ResponseModel = Object.assign(
      new ResponseModel(),
      req.body as ResponseModel
    );

    try {
      //get 1A response for comparison
      const OneAResponse: ResponseModel = await monResponseModel
        .findOne({
          GameId: response.GameId,
          TeamId: response.TeamId,
          QuestionId: response.SiblingQuestionId
        })
        .then(r => Object.assign(new ResponseModel(), r.toJSON()));
      console.log("RESPONSE", response, OneAResponse);

      //get the possible answer matching our response
      const question: QuestionModel = await monQModel
        .findById(response.QuestionId)
        .then(r => Object.assign(new QuestionModel(), r.toJSON()));
      let bestCandidate: ValueObj;
      let secondBestCandidate: ValueObj;

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

              console.log("PRIORITY FOUND AT", OneAPriorityIndex);

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
          console.log("LOOK FOR SKILLSCORE", skillScore, pa);
        } else {
          console.log("DOOKIE:", pa);
        }
      });

      //sort the possible answers by skillScore so we can see how good the team's choice is
      let sortedPas = question.PossibleAnswers.sort((a, b) => {
        //return 1;
        return a["skillScore"] > b["skillScore"] ? 1 : 0;
      });

      console.log("SORTEMS", sortedPas);

      (response.Answer as ValueObj[]).forEach(ans => {
        ans.idealValue = 2;
        ans.maxPoints = 2;
        ans.minPoints = 0;
        sortedPas.forEach((pa, i) => {
          if (pa.label == ans.label && ans.data == "true") {
            console.log(pa.label, ans.label, ans.data, i);
            response.Score = i;
          }
        });
      });

      response.SkipScoring = true;
      response.MaxScore = 2;

      console.log("RESPONSE!!!!!!!!", response);

      // Now that response object has idealValues, calculate its score as you would and other multiple-choice
      //response.Score = response.resolveScore();
      req.body = response;
      next();
    } catch (err) {
      console.log(err);
      res.status(500).json("no sir");
    }
  }

  public async GetTeamResponsesByRound(req: Request, res: Response) {
    const fetcher = req.body as ResponseFetcher;
    try {
      let responses: ResponseModel[] = await monResponseModel
        .find({
          TeamId: fetcher.TeamId,
          GameId: fetcher.GameId,
          SubRoundId: fetcher.SubRoundId
        })
        .then(r => r.map(resp => resp.toJSON() as ResponseModel));
      responses = responses.sort((a, b) => {
        if (!a.TeamNumber || !b.TeamNumber || a.TeamNumber == b.TeamNumber)
          return 0;
        return a.TeamNumber > b.TeamNumber ? 1 : 0;
      });
      res.json(responses);
    } catch (err) {
      res.json(err);
    }
  }

  public async GetGameResponsesBySubround(req: Request, res: Response) {
    try {
      let GameId = req.params.gameid;

      let game: GameModel = await monGameModel
        .findById(GameId)
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      if (!game) throw new Error("problem with game");

      console.log(game);

      let currentRound = game.CurrentRound;
      let sr: SubRoundModel = await monSubRoundModel
        .findOne({ Name: currentRound.ChildRound.toUpperCase() })
        .then(sr => (sr ? Object.assign(new SubRoundModel(), sr) : null));

      if (!sr) throw new Error("problem with subround");

      const responses = await monResponseModel.find({
        GameId,
        SubRoundId: sr._id
      });

      if (!responses) throw new Error("NO RESPONSES");
      res.json(responses);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't get responses");
    }
  }

  public async SaveRound3Response(req: Request, res: Response) {
    const subround: SubRoundModel = Object.assign(
      new SubRoundModel(),
      req.body as SubRoundModel
    );
    console.log(subround);
    try {
      let questions = subround.Questions;
      for (let i = 0; i < questions.length; i++) {
        let response = questions[i].Response;
      }

      res.json();
    } catch {}
  }

  public async SubmitBid(req: Request, res: Response, next) {
    const response: ResponseModel = Object.assign(
      new ResponseModel(),
      req.body as ResponseModel
    );
    console.log("++SubmitBid");

    try {
      const game = await monGameModel
        .findById(response.GameId)
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      console.log(
        "game.CurrentRound.CurrentHighestBid.data %d",
        game.CurrentRound.CurrentHighestBid.data
      );
      //  let gameForUpdate = Object.assign(game, { CurrentRound: Object.assign(game.CurrentRound, { CurrentHighestBid }) });

      //get all the responses to determine if this is the highest
      //const bids: ResponseModel[] = await monResponseModel.find({ GameId: response.GameId, QuestionId: response.QuestionId }).then(bids => bids ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);
      //console.log("found these bids %o", bids)

      const submittedBidValue = parseFloat(response.Answer[0].data);

      let foundHigherBid = false;
      if (
        game.CurrentRound.CurrentHighestBid &&
        submittedBidValue < game.CurrentRound.CurrentHighestBid.data
      ) {
        foundHigherBid = true;
        console.log(" found Higher bid");
      }

      /*
                for (let i = 0; i < bids.length; i++) {
                let bid = bids[i].Answer[0];
                console.log(" bid.data: %d", bid.data)
                if (parseFloat(bid.data) >= submittedBidValue) {
                    foundHigherBid = true;
                    break;
                }
            }

            */

      if (!foundHigherBid) {
        const team: TeamModel = await monTeamModel
          .findById(response.TeamId)
          .then(t => (t ? Object.assign(new TeamModel(), t.toJSON()) : null));

        console.log("BID IS", submittedBidValue);

        const CurrentHighestBid: Partial<ValueObj> = {
          data: submittedBidValue.toString(),
          label: team.Name ? team.Name : team.Number.toString(),
          targetObjId: team._id
        };

        const game = await monGameModel
          .findById(team.GameId)
          .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));

        let gameForUpdate = Object.assign(game, {
          CurrentRound: Object.assign(game.CurrentRound, { CurrentHighestBid })
        });
        let mapping = await monMappingModel
          .findOneAndUpdate(
            { GameId: game._id, ParentRound: game.CurrentRound.ParentRound },
            gameForUpdate.CurrentRound,
            { new: true }
          )
          .then(mapping =>
            mapping
              ? Object.assign(new RoundChangeMapping(), mapping.toJSON())
              : null
          );

        const updatedGame = await monGameModel.findByIdAndUpdate(
          team.GameId,
          gameForUpdate
        );

        console.log("the mapping was updated to: ", mapping);
        AppServer.LongPoll.publishToId(
          "/listenforgameadvance/:gameid",
          response.GameId,
          gameForUpdate.CurrentRound
        );
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldnt do bid");
    }
  }

  public async getTeamsFor4BRating(req: Request, res: Response) {
    try {
      const GameId = req.params.gameid;

      //do this a better way.
      const SubRoundId = await monSubRoundModel
        .findOne({ Name: "PRICING" })
        .then(r => (r ? r._id : null));
      if (!SubRoundId) throw new Error("No subuound found");

      const responses: ResponseModel[] = await monResponseModel
        .find({ GameId, SubRoundId })
        .then(r =>
          r ? r.map(r => Object.assign(new ResponseModel(), r.toJSON())) : []
        );

      if (!responses || !responses.length)
        throw new Error("No responses found");

      //group the responses by team
      let groupedResponses = groupBy(responses, "TeamId");

      //get the questions for this round.
      let questions: QuestionModel[] = await monQModel
        .find({ RatingMarker: "TEAM_RATING" })
        .then(q =>
          q
            ? q.map(quest => Object.assign(new QuestionModel(), quest.toJSON()))
            : []
        );

      //now map over the responses, building out questions for each team.
      let finalQuestions: QuestionModel[] = [];

      Object.keys(groupedResponses).map(k => {
        console.log(groupedResponses[k]);

        //let bidResponse = groupedResponses[k].filter(r => r.Answer && r.Answer[0] && r.Answer[0].label && r.Answer[0].label.toUpperCase() == "PRICING")[0] || null;
        let rationaleResponse =
          groupedResponses[k].filter(
            r =>
              r.Answer &&
              r.Answer[0] &&
              r.Answer[0].label &&
              r.Answer[0].label.toUpperCase() == "EXPLANATION"
          )[0] || null;

        finalQuestions = finalQuestions.concat(
          questions.map(q => {
            return Object.assign({}, q, {
              Text: q.Text + " " + rationaleResponse.TeamNumber,
              TargetTeamId: k,
              SubText: rationaleResponse ? rationaleResponse.Answer[0].data : ""
            });
          })
        );
      });

      res.json(finalQuestions);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldn't get resposnes");
    }
  }

  public async GetPlayerRatingsQuestions(req: Request, res: Response) {
    try {
      const srid = req.params.subroundId;
      const userID = req.params.userID
      const sr: SubRoundModel = await monSubRoundModel
        .findById(srid)
        .then(sr => sr.toJSON() as SubRoundModel);

      if (!sr) throw new Error("NO SUBROUND FOUND");

      const round: RoundModel = await monRoundModel
        .findById(sr.RoundId)
        .then(r => r.toJSON() as RoundModel);
      if (!round) throw new Error("NO ROUND FOUND");
      const buildResponse = (
        responses: ResponseModel[],
        question: QuestionModel
      ) => {
        /*return responses.find(r => {
                    return true
                }) || new ResponseModel*/
        const response = responses.find(
          r => r.targetObjId == question.PossibleAnswers[0].targetObjId && r.UserId == userID
        );
        question.PossibleAnswers = question.PossibleAnswers.filter(
          pa =>
            !(pa as any).Round ||
            (round.Label &&
              (pa as any).Round &&
              (pa as any).Round == round.Label)
        );
        if (response) {
          (response.Answer as SliderValueObj[]) = question.PossibleAnswers.map(
            pa => {
              let relevantReponse: ResponseModel = responses.find(r => {
                return (
                  (r.Answer as SliderValueObj[])[0] &&
                  pa.label &&
                  (r.Answer as SliderValueObj[])[0].label == pa.label
                );
              });

              return relevantReponse ? relevantReponse.Answer[0] : pa;
            }
          );
          return response;
        }
        return new ResponseModel();
      };

      const team: TeamModel = Object.assign(new TeamModel(), req.body);

      //get the game so we can determine which players is the manager
      const game: GameModel = await monGameModel
        .findById(team.GameId)
        .then(g => (g ? g.toJSON() : null));
      if (!game) throw new Error("no game");
      const jobMap = game.CurrentRound.UserJobs;

      //get the players so we can rate each one
      const players: UserModel[] = await monTeamModel
        .findById(team._id)
        .populate("Players")
        .then(t =>
          t
            ? t.toObject().Players.map(p => Object.assign(new UserModel(), p))
            : null
        );

      //get the id of the current subround
      const subround = await monSubRoundModel
        .findOne({
          Name: game.CurrentRound.ChildRound.toUpperCase()
        })
        .then(r => (r ? r.toJSON() : null));
      if (!subround) throw new Error("no subround");
      //get the individual rating questions
      const question: QuestionModel = await monQModel
        .findOne({ RatingMarker: RatingType.MANAGER_RATING })
        .then(q => (q ? Object.assign(new QuestionModel(), q.toJSON()) : null));

      //add text question per player
      const textQuestion = new QuestionModel();

      //get any ratings already submitted for the team
      const ratings: ResponseModel[] = await monResponseModel
        .find({
          TeamId: team._id,
          SubRoundId: subround._id
        })
        .then(rs => (rs ? rs.map(r => r.toJSON()) : []));

      //ratings.map(r => console.log(r., r.Answer[0]))

      const finalQuestions: QuestionModel[] = players.map(p => {
        //build the manager question
        let job: JobName = jobMap[p._id.toString()];
        //if(jobMap[p._id.toString()] == JobName.MANAGER){
        let q: QuestionModel = JSON.parse(JSON.stringify(question));
        q.PossibleAnswers = question.PossibleAnswers.map(pa => {
          return Object.assign({}, pa, {
            idealValue: 0,
            maxPoints: 3,
            minPoints: 1,
            min: 0,
            max: 10,
            targetObjId: p._id.toString(),
            targetObjClass: "UserModel",
            targetObjName: p.Name,
            category: (pa as any).Round || null
          });
        });

        let textPa = new SliderValueObj();
        textPa.targetObjId = p._id.toString();
        textPa.targetObjClass = "UserModel";
        textPa.targetObjName = p.Name;
        textPa.OverrideType = QuestionType.TEXTAREA;
        textPa.label = "Comments";
        q.PossibleAnswers.push(textPa);

        q.Response = buildResponse(ratings, q);
        q.RatingMarker =
          jobMap[p._id.toString()] == JobName.MANAGER
            ? RatingType.MANAGER_RATING
            : RatingType.IC_RATING;
        q.SubText =
          jobMap[p._id.toString()] == JobName.MANAGER
            ? "How did " + p.Name + " perform as a manager?"
            : "How did " + p.Name + " do this round?";
        q.Text = jobMap[p._id.toString()] != JobName.MANAGER && "";
        return q;
      });

      res.json(finalQuestions);
    } catch (err) {
      console.log("ERROR GETTING QUESTIONS", err);
      res.status(500);
      res.send("couldn't get QUESTIONS");
    }
  }

  public async savePriorityRating(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const response: ResponseModel = Object.assign(
      new ResponseModel(),
      req.body as ResponseModel
    );
    try {
      const question = await monQModel
        .findById(response.QuestionId)
        .then(q => q.toJSON());

      const answers: SliderValueObj[] = response.Answer as SliderValueObj[];

      if (question.Type == QuestionType.PRIORITY) {
        for (let i = 0; i < answers.length; i++) {
          let answer = answers[i];
          let rating: ResponseModel = new ResponseModel();

          rating = Object.assign(response, { Answer: [] });
          delete rating._id;
          rating.targetObjClass = "UserModel";
          rating.targetObjId = answer.targetObjId;
          rating.DisplayLabel = question.Text;
          rating.Score = answers.length - i;

          var oldResponse = await monResponseModel
            .findOne({
              targetObjId: rating.targetObjId,
              targetObjClass: rating.targetObjClass,
              SubRoundId: rating.SubRoundId,
              QuestionId: rating.QuestionId
            })
            .then(r => (r ? r.toJSON() : null));

          if (oldResponse) {
            console.log("UPDATING OLD RESPONSE");
            await monResponseModel
              .findOneAndUpdate(
                {
                  targetObjId: rating.targetObjId,
                  targetObjClass: rating.targetObjClass,
                  SubRoundId: rating.SubRoundId,
                  QuestionId: rating.QuestionId
                },
                rating
              )
              .then(r => (r ? r.toJSON() : null));
          } else {
            await monResponseModel.create(rating);
          }
        }
      } else {
        let answers = response.Answer as SliderValueObj[];
        for (var i = 0; i < answers.length; i++) {
          let ans = answers[i];
          console.dir(
            "HHHHHHHHHHHEEEEEEEEEEEEEEEEEEEEEEEEEEYYYYYYYYYYYYY",
            response
          );
          let queryObj: any = {
            UserId: response.UserId,
            DisplayLabel: ans.label,
            SubRoundId: response.SubRoundId,
            GameId: response.GameId,
            TeamId: response.TeamId,
            QuestionId: response.QuestionId,
            targetObjId: (response.Answer as SliderValueObj[])[0].targetObjId
          };

          const oldResponse = await monResponseModel
            .findOne(queryObj)
            .then(r => (r ? r.toJSON() : null));
          let r = Object.assign({}, response);
          r.targetObjClass = "UserModel";
          r.targetObjId = (response.Answer as SliderValueObj[])[0].targetObjId;
          r.DisplayLabel = ans.label;
          r.Answer = (r.Answer as SliderValueObj[]).filter(
            pa => pa.label == ans.label
          );
          r.Score = Number(ans.data || 0);
          if (!oldResponse) {
            delete response._id;
            var SaveResponse = await monResponseModel
              .create(r)
              .then(r => r.toObject() as ResponseModel);
          } else {
            delete response._id;
            var SaveResponse = await monResponseModel
              .findOneAndUpdate(queryObj, r, { new: true })
              .then(r => r.toObject() as ResponseModel);
          }
          console.log(SaveResponse);
        }
      }

      res.json(response);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldn't save response for priotires");
    }
  }

  public async SavePlayerRatings(req: Request, res: Response) {
    try {
      let responses = req.body as ResponseModel[];
      let savedResponses: ResponseModel[] = [];
      for (let j = 0; j < responses.length; j++) {
        let response = responses[j];
        let answers = response.Answer as SliderValueObj[];
        for (var i = 0; i < answers.length; i++) {
          let ans = answers[i];
          let queryObj: any = {
            UserId: response.UserId,
            DisplayLabel: ans.label,
            SubRoundId: response.SubRoundId,
            GameId: response.GameId,
            TeamId: response.TeamId,
            QuestionId: response.QuestionId,
            targetObjId: (response.Answer as SliderValueObj[])[0].targetObjId
          };

          const oldResponse = await monResponseModel
            .findOne(queryObj)
            .then(r => (r ? r.toJSON() : null));
          let r = Object.assign({}, response);
          r.targetObjClass = "UserModel";
          r.targetObjId = (response.Answer as SliderValueObj[])[0].targetObjId;
          r.DisplayLabel = ans.label;
          r.Answer = (r.Answer as SliderValueObj[]).filter(
            pa => pa.label == ans.label
          );
          if (!ans.OverrideType) r.Score = Number(ans.data || 0);
          if (!oldResponse) {
            delete r._id;
            console.log("WAS NEW");
            var SaveResponse = await monResponseModel
              .create(r)
              .then(r => r.toObject() as ResponseModel);
          } else {
            delete r._id;
            console.log("WAS OLD");
            var SaveResponse = await monResponseModel
              .findOneAndUpdate(queryObj, r, { new: true })
              .then(r => r.toObject() as ResponseModel);
          }

          savedResponses.push(SaveResponse);
          console.log("LOOK AT THIS", SaveResponse);
        }
      }

      res.json(savedResponses);
    } catch (err) {
      console.log(err);
      res.status(500).send("error");
    }
  }

  /**
   * Returnss all Subround scores with the given ID
   * @param req
   * @param res
   */
  public static async getSubRoundScores(req: Request, res: Response) {
    const Name = req.params.subroundid.toUpperCase();
    const GameId = req.params.gameid;
    console.log(Name);
    try {
      const subround: SubRoundModel = await monSubRoundModel
        .findOne({ Name })
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );
      let SubRoundLabel = subround.Label;
      console.log("{  GameId: %s,}", GameId);

      var roundScores: SubRoundScore[] = await monSubRoundScoreModel
        .find({ GameId })
        .then(srs =>
          srs
            ? srs.map(b => Object.assign(new SubRoundScore(), b.toJSON()))
            : []
        );

      console.log(roundScores);
      if (!roundScores) throw new Error();
      roundScores = roundScores.filter(rs => {
        console.log(
          rs.SubRoundNumber,
          SubRoundLabel,
          rs.SubRoundLabel <= SubRoundLabel
        );
        return rs.SubRoundNumber <= SubRoundLabel;
      });
      console.log(roundScores);
      res.json(roundScores);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't get subroundscores");
    }
  }

  public async getScores(req: Request, res: Response) {
    try {
      //const SubRoundId = req.params.subroundid;
      //const RoundId = req.params.roundid;
      const GameId = req.params.gameid;

      const game: GameModel = await monGameModel
        .findById(GameId)
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      let mapping: RoundChangeMapping = game.CurrentRound;

      console.log(game, mapping);

      const subround: SubRoundModel = await monSubRoundModel
        .findOne({ Name: mapping.ChildRound.toUpperCase() })
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );
      const round: RoundModel = await monRoundModel
        .findById(subround.RoundId)
        .then(sr => (sr ? Object.assign(new RoundModel(), sr.toJSON()) : null));

      let RoundId = round._id;
      let SubRoundId = subround._id;
      //get all teams' responses for the round, then group them by team
      const responses: ResponseModel[] = await monResponseModel
        .find({ GameId })
        .then(responses =>
          responses
            ? responses.map(b => Object.assign(new ResponseModel(), b.toJSON()))
            : []
        );

      const teams: TeamModel[] = await monTeamModel
        .find({ GameId })
        .then(t => (t ? t.map(team => team.toJSON()) : []));

      //const subround: SubRoundModel = await monSubRoundModel.findById(SubRoundId).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null);

      let groupedResponses = groupBy(responses, "TeamId");

      //console.log(subround);

      var scores = Object.keys(groupedResponses).map(k => {
        let score = new FeedBackModel();

        score.TotalGameScore = groupedResponses[k].reduce(
          (totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          },
          0
        );

        score.TotalRoundScore = groupedResponses[k]
          .filter(r => r.RoundId == RoundId)
          .reduce((totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          }, 0);

        score.TotalSubroundScore = groupedResponses[k]
          .filter(r => r.SubRoundId == SubRoundId)
          .reduce((totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          }, 0);

        score.TargetObjectId = k;
        score.Label =
          "Team " + teams.filter(t => t._id.toString() == k)[0]
            ? "Team " +
              teams.filter(t => t._id.toString() == k)[0].Number.toString()
            : null;
        score.TargetModel = "TeamModel";

        score.TeamsFeedBack = subround ? subround.FeedBack : null;

        //special case for round three feedback
        if (
          (subround && subround.Name == "DEALRENEWAL") ||
          subround.Name == "DEALSTRUCTURE"
        ) {
          let round3Response = groupedResponses[k].filter(
            r => r.SubRoundId == SubRoundId
          )[0];

          let posOrNeg;
          if (round3Response) {
            let highCsat = false;
            let gotDeal = true;
            for (
              let i = 0;
              i < (round3Response.Answer as SliderValueObj[]).length;
              i++
            ) {
              let ans = (round3Response.Answer as SliderValueObj[])[i];
            }

            score.TeamsFeedBack = score.TeamsFeedBack.filter(fb => {
              if (!gotDeal) {
                return (
                  fb.ValueDemomination == ValueDemomination.NEGATIVE ||
                  fb.ValueDemomination == ValueDemomination.NEUTRAL
                );
              } else if (highCsat) {
                return (
                  fb.ValueDemomination == ValueDemomination.POSITIVE ||
                  fb.ValueDemomination == ValueDemomination.NEUTRAL
                );
              } else {
                return fb.ValueDemomination == ValueDemomination.NEUTRAL;
              }

              return true;
            });
          }

          score.TeamsFeedBack = score.TeamsFeedBack.filter(
            fb => fb.ValueDemomination != posOrNeg
          );
        }

        if (subround && subround.Name == "BID") {
          var highestBid = 0;
        }

        return score;
      });

      scores = scores.sort((s1, s2) => {
        return s1.TotalGameScore != s2.TotalGameScore
          ? s1.TotalGameScore > s2.TotalGameScore
            ? 1
            : -1
          : 0;
      });

      res.json(scores);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldn't get scores");
    }
  }

  public async getUserScores(req: Request, res: Response) {
    try {
      const SubRoundId = req.params.subroundid;
      const RoundId = req.params.roundid;
      const GameId = req.params.gameid;
      const targetObjClass = "UserModel";

      //get all teams' responses for the round, then group them by team
      const responses: ResponseModel[] = await monResponseModel
        .find({ GameId, targetObjClass })
        .then(bids =>
          bids
            ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON()))
            : []
        );
      const users: UserModel[] = await monUserModel
        .find()
        .then(users => (users ? users.map(user => user.toJSON()) : []));

      let groupedResponses = groupBy(responses, "targetObjId");

      console.log(groupedResponses);
      var scores = Object.keys(groupedResponses).map(k => {
        let score = new FeedBackModel();

        score.TotalGameScore = groupedResponses[k].reduce(
          (totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          },
          0
        );

        score.TotalRoundScore = groupedResponses[k]
          .filter(r => r.RoundId == RoundId)
          .reduce((totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          }, 0);

        score.TotalSubroundScore = groupedResponses[k]
          .filter(r => r.SubRoundId == SubRoundId)
          .reduce((totalScore, r: ResponseModel) => {
            return Number((totalScore + r.Score).toFixed(2));
          }, 0);

        let user = Object.assign(
          new UserModel(),
          users.filter(u => u._id.toString() == k)[0]
        );

        score.TargetObjectId = k;
        score.Label = user.Name;
        score.TargetModel = "UserModel";

        score.IndividualFeedBack = [];
        groupedResponses[k]
          .filter(r => r.RoundId == RoundId)
          .map(r => {
            console.log("response!!!!!!!!!!!", r);
            score.IndividualFeedBack.push(r);
            return r;
          });
        return score;
      });

      scores = scores.sort((s1, s2) => {
        return s1.TotalGameScore != s2.TotalGameScore
          ? s2.TotalGameScore > s1.TotalGameScore
            ? 1
            : -1
          : 0;
      });

      res.json(scores);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldn't get responses");
    }
  }

  public async ReadMessage(req: Request, res: Response) {
    try {
      const userId = req.params.userid;
      const messageId = req.params.messageid;

      let user: UserModel = await monUserModel
        .findById(userId)
        .then(u => (u ? Object.assign(new UserModel(), u.toJSON()) : null));

      if (!user) throw new Error("couldn't get user");
      if (user.ReadMessages.indexOf(messageId) == -1) {
        user.ReadMessages.push(messageId);
        user = await monUserModel
          .findByIdAndUpdate(
            userId,
            { ReadMessages: user.ReadMessages },
            { new: true }
          )
          .then(u => (u ? Object.assign(new UserModel(), u.toJSON()) : null));
      }

      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't mark message read");
    }
  }

  public async GetUserRatingsSoFar(req: Request, res: Response) {
    try {
      const targetObjId = req.params.userid;
      const TeamId = req.params.teamid;

      //let currentSubRound: SubRoundModel = await monSubRoundModel.findById(SubRoundId).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null);
      const team: TeamModel = await monTeamModel
        .findById(TeamId)
        .then(t => (t ? Object.assign(new TeamModel(), t.toJSON()) : null));

      const game = await monGameModel
        .findById(team.GameId)
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      const currentSubRound = await monSubRoundModel
        .findOne({ Name: game.CurrentRound.ChildRound.toLocaleUpperCase() })
        .then(s => (s ? Object.assign(new SubRoundModel(), s.toJSON()) : null));

      if (!currentSubRound) throw new Error("Didn't get subround");

      let responses: ResponseModel[] = await monResponseModel
        .find({
          targetObjId,
          targetObjClass: "UserModel",
          SubRoundId: currentSubRound._id.toString(),
          GameId: team.GameId
        })
        .then(rs =>
          rs
            ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON()))
            : null
        );

      if (!responses) throw new Error("Didn't get responses");

      // sorted subRoundIds, truncated to include only currentSubRound or before
      let subRoundIds: string[] = [currentSubRound._id];

      // build array of unique DisplayLabel (rating criteria name) for the responses
      let displayLabels: string[] = responses.reduce(
        (allDisplayLabels: string[], response: ResponseModel) => {
          if (!(response.DisplayLabel in allDisplayLabels)) {
            allDisplayLabels.push(response.DisplayLabel);
          }
          return allDisplayLabels;
        },
        []
      );

      let orderedResponses: Array<{ [key: string]: ResponseModel[] }> = [];
      // Build orderedResponses based on already sorted subRoundIds, so orderedResponses are sorted too
      for (var n = 0; n < subRoundIds.length; n++) {
        orderedResponses[n] = {};
        displayLabels.forEach(displayName => {
          orderedResponses[n][displayName] = responses
            .filter(
              r =>
                r.SubRoundId == subRoundIds[n] && r.DisplayLabel == displayName
            )
            .map(r => {
              return Object.assign(r, {
                RoundName: currentSubRound
                  ? "Round " + currentSubRound.Label.charAt(0)
                  : null
              });
            });
        });
      }

      if (!Object.keys(orderedResponses[0]).length) orderedResponses = [];
      res.json(orderedResponses);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't get user scores");
    }
  }

  public async getFacilitatorResponsesByRound(req: Request, res: Response) {
    try {
      const GameId = req.params.gameid;

      const game: GameModel = await monGameModel
        .findById(GameId)
        .populate("Teams")
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));

      let mapping: RoundChangeMapping = game.CurrentRound;

      let subround: SubRoundModel = await monSubRoundModel
        .findOne({ Name: mapping.ChildRound.toLocaleUpperCase() })
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );

      //get the regular questions for the current roud

      //get the player rating questions for the current round
      let responses: ResponseModel[] = await monResponseModel
        .find({ GameId, SubRoundId: subround._id })
        .then(rs =>
          rs ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON())) : []
        );

      let groupedResponses: any = {};

      game.Teams.forEach(t => {
        if (!groupedResponses["Team " + t.Number.toString()])
          groupedResponses["Team " + t.Number.toString()] = responses.filter(
            r => {
              return r.TeamId == t._id;
            }
          );
      });

      res.json(groupedResponses);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't get getFascillitatorResponsesByRound");
    }
  }

  public async SaveTeamName(req: Request, res: Response) {
    try {
      let team: TeamModel = req.body as TeamModel;

      let updatedTeam = await monTeamModel
        .findByIdAndUpdate(team._id, { Name: team.Name })
        .then(t => (t ? Object.assign(new TeamModel(), t.toJSON()) : null));
      if (!updatedTeam) throw new Error();
      AppServer.LongPoll.publishToId(
        "/sapien/api/gameplay/listenforteamname/:teamid",
        team._id,
        team
      );

      res.json("updated");
    } catch (err) {
      res.status(500).send("Couldn't save team name.");
    }
  }

  public async getCurrentMapping(req: Request, res: Response) {
    try {
      let GameId = req.params.gameid;
      let game = await monGameModel
        .findById(GameId)
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      if (!game) throw new Error("Failed to load game");
      if (!game.CurrentRound)
        throw new Error("No current round for game " + game._id);
      res.json(game.CurrentRound);
    } catch (err) {
      console.log(err);
      res.status(501).send("couldn't get game");
    }
  }

  public routes() {
    //this.router.all("*", cors());
    this.router.get("/", this.GetRounds.bind(this));
    this.router.get(
      "/responses/:gameid/",
      this.GetGameResponsesBySubround.bind(this)
    );
    this.router.get(
      "/get4bresponses/:gameid",
      this.getTeamsFor4BRating.bind(this)
    );
    this.router.get(
      "/readmessage/:messageid/:userid",
      this.ReadMessage.bind(this)
    );
    this.router.post(
      "/rateplayers/:subroundId/:userID",
      this.GetPlayerRatingsQuestions.bind(this)
    );
    this.router.get(
      "/getcurrentmapping/:gameid",
      this.getCurrentMapping.bind(this)
    );
    this.router.post("/response", this.SaveResponse.bind(this));
    this.router.post(
      "/1bresponse",
      this.Save1BResponse.bind(this),
      this.SaveResponse.bind(this)
    );
    this.router.post(
      "/roundresponses",
      this.GetTeamResponsesByRound.bind(this)
    );
    this.router.post(
      "/bid",
      this.SubmitBid.bind(this),
      this.SaveResponse.bind(this)
    );
    this.router.post("/3response", this.SaveRound3Response.bind(this));
    this.router.get("/getscores/:gameid", this.getScores.bind(this)),
      this.router.get(
        "/getuserscores/:subroundid/:roundid/:gameid",
        this.getUserScores.bind(this)
      ),
      this.router.get(
        "/getsubroundscores/:gameid/:subroundid",
        GamePlayRouter.getSubRoundScores.bind(this)
      ),
      this.router.post("/response/rating", this.SavePlayerRatings.bind(this)),
      this.router.get(
        "/getuserrating/:userid/:teamid",
        this.GetUserRatingsSoFar.bind(this)
      );
    this.router.get(
      "/getfacilitatorresponses/:gameid",
      this.getFacilitatorResponsesByRound.bind(this)
    );
    this.router.post("/saveteamname", this.SaveTeamName.bind(this));
    //this.router.get("/listenforteamname", this.SaveTeamName.bind(this))
    this.router.post("/savesocialresponse", this.SaveSocialResponse.bind(this));
  }
}

export default new GamePlayRouter().router;
