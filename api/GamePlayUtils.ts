import { JobName } from "./../shared/models/UserModel";
import { monMappingModel } from "./controllers/GameCtrl";
import { monRoundModel, monSubRoundModel, monQModel } from "./controllers/RoundCtrl";
import RoundChangeMapping from "../shared/models/RoundChangeMapping";
import SubRoundScore from "../shared/models/SubRoundScore";
import GameModel from "../shared/models/GameModel";
import SubRoundModel from "../shared/models/SubRoundModel";
import QuestionModel, { RatingType } from "../shared/models/QuestionModel";
import ResponseModel from "../shared/models/ResponseModel";
import { SliderValueObj } from "../shared/entity-of-the-state/ValueObj";
import TeamModel from "../shared/models/TeamModel";
import RoundModel from "../shared/models/RoundModel";
import { MongooseDocument, Mongoose } from "mongoose";
import BaseModel from "../shared/base-sapien/models/BaseModel";
import { monResponseModel, monSubRoundScoreModel } from "./controllers/GamePlayCtrl";
import { monTeamModel } from "./controllers/TeamCtrl";

export default class GamePlayUtils {

  public static async HandleRoundChange(
    passedMapping: RoundChangeMapping,
    game: GameModel
  ): Promise<RoundChangeMapping> {
    let mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), {
      ...passedMapping
    });

    console.log("Roundchange mapping: as curried", mapping.ShowFeedback, mapping.SlideFeedback, passedMapping.ShowFeedback, passedMapping.SlideFeedback);

    //Pick role for each player on each team
    //TODO: get rid of magic string
    mapping.UserJobs = {};

    mapping.ParentRound = mapping.ParentRound.toLowerCase();
    mapping.ChildRound = mapping.ChildRound.toLowerCase();

    const round = await monRoundModel
      .findOne({ Name: mapping.ParentRound.toUpperCase() })
      .then(r => r.toJSON());

    let srModel: SubRoundModel = await monSubRoundModel
      .findOne({ Name: mapping.ChildRound.toUpperCase() })
      .then(x => x.toJSON());
    let SubRoundLabel: String = srModel.Label.toString().toUpperCase();
    let newMapping: RoundChangeMapping;

    console.log("RELEVANT SUBROUND IS: ", SubRoundLabel);
    let RoundId = round._id;
    mapping.RoundId = round._id;

    //make sure the current mapping has the correct child round
    var oldMapping: RoundChangeMapping = await monMappingModel
      .findOneAndUpdate(
        { GameId: game._id, ParentRound: mapping.ParentRound },
        {
          ChildRound: mapping.ChildRound,
          ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
          ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
          ShowIndividualFeedback: mapping.ShowIndividualFeedback,
          SlideFeedback: mapping.SlideFeedback,
          RoundId,
          SlideNumber: mapping.SlideNumber
        },
        { new: true },
        function (err, doc) {
          if (err) {
            console.log("Something wrong when updating data!", err);
          }
        }
      )
      .then(
        r => (r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null)
      );

    //Determine if an event should be sent to players or if the new mapping only reflects a change in slide presentation
    let advanceGame = true;
    if (
      oldMapping &&
      oldMapping.ChildRound == mapping.ChildRound &&
      oldMapping.ShowFeedback == mapping.ShowFeedback &&
      oldMapping.ShowIndividualFeedback == mapping.ShowIndividualFeedback &&
      oldMapping.ShowRateUsers == mapping.ShowRateUsers
    ) {
      //in cases where only a slide is advanced, and we shouldn't see a gameplay change, all the above props will be unchange.
      //the only change we expect is to mapping/oldMapping.SlideNumber
      advanceGame = false;
    }

    if (!oldMapping) {
      if (mapping.ParentRound.toLowerCase() == "engineeringround") {
        game.Teams.forEach(t => {
          var managerAssigned = false;
          let isChip = false;
          for (let i = 0; i < t.Players.length; i++) {
            let pid = t.Players[i].toString();
            // console.log(typeof pid, pid)

            if (i == 2) {
              game.HasBeenManager.push(pid);
              mapping.UserJobs[pid] = JobName.MANAGER;
              managerAssigned = true;
            } else {
              mapping.UserJobs[pid] = !isChip
                ? JobName.INTEGRATED_SYSTEMS
                : JobName.CHIPCO;
              isChip = !isChip;
            }
          }
        });
      } else {
        //set another manager
        let roundNumber = Number(round.Label);
        console.log("HAD USER JOBS FOR", roundNumber);
        game.Teams.forEach(t => {
          //   console.log("TEAM ", t)
          for (let i = 0; i < t.Players.length; i++) {
            let pid = t.Players[i].toString();

            if (i == roundNumber - 1) {
              game.HasBeenManager.push(pid);
              mapping.UserJobs[pid] = JobName.MANAGER;
            }
          }

          //make sure each team has a manager, even if all the team members have been manager
          if (
            t.Players.every(p => {
              //console.log("examing", p, mapping.UserJobs[p._id.toString()])
              return mapping.UserJobs[p._id.toString()] != JobName.MANAGER;
            })
          ) {
            //console.log("DIDN'T FIND MANAGER FOR ", t)
            mapping.UserJobs[
              t.Players[
                Math.floor(Math.random() * t.Players.length)
              ]._id.toString()
            ] = JobName.MANAGER;
          }
        });
      }

      mapping.GameId = game._id;
      newMapping = await monMappingModel
        .create(mapping)
        .then(r => Object.assign(new RoundChangeMapping(), r.toJSON()));
    } else if (!oldMapping.UserJobs) {
      let roundNumber = Number(round.Label);
      console.log("HAD NO USER JOBS FOR", roundNumber);

      game.Teams.forEach(t => {
        for (let i = 0; i < t.Players.length; i++) {
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            mapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every(p => {
            //console.log("examing", p, mapping.UserJobs[p._id.toString()])
            return mapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
          //console.log("DIDN'T FIND MANAGER FOR ", t)
          mapping.UserJobs[
            t.Players[
              Math.floor(Math.random() * t.Players.length)
            ]._id.toString()
          ] = JobName.MANAGER;
        }
      });
    } else if (SubRoundLabel.toLowerCase() == "4c") {
      console.log("WE ARE LOOKING FOR BLUE_KITES");
      let pindex = 0;
      game.Teams.forEach(t => {
        //console.log("\t Blue_kite teams %d:", pindex++);
        //console.log("\t Blue_kite oldMapping %o:", oldMapping);
        //let playersEligible: Array<UserModel> = t.Players.filter(p => oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER);

        //console.log("\t Blue_kite players %o:", playersEligible);
        // let rIndex = Math.floor(Math.random() * playersEligible.length);

        oldMapping.UserJobs[t.Players[1].toString()] = JobName.BLUE_KITE;
        //console.log("Blue_kite winner is: %s, id: %s,  name: %s", rIndex, playersEligible[rIndex]._id, (playersEligible[rIndex].FirstName + " " + playersEligible[rIndex].LastName));
      });

      newMapping = oldMapping;
    } else {
      let roundNumber = Number(round.Label);

      console.log("HAD MAPPING WITH JOBS");
      game.Teams.forEach(t => {
        for (let i = 0; i < t.Players.length; i++) {
          console.log("What up playa", t.Players[i]);
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            oldMapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every(p => {
            //console.log("examing", p, mapping.UserJobs[p._id.toString()])
            return oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
          //console.log("DIDN'T FIND MANAGER FOR ", t)
          oldMapping.UserJobs[
            t.Players[
              Math.floor(Math.random() * t.Players.length)
            ]._id.toString()
          ] = JobName.MANAGER;
        }
      });
      newMapping = oldMapping;
    }

    // console.log( "blue_kite mapping.UserJobs %o", mapping.UserJobs);

    mapping.GameId = game._id;

    if ((!newMapping || !newMapping.ParentRound.length) && !oldMapping) {
      throw new Error("Couldn't make mapping");
    }

    console.log(newMapping, passedMapping);

    if (!newMapping) newMapping = passedMapping;

    newMapping.ShowFeedback = passedMapping.ShowFeedback;
    newMapping.SlideFeedback = passedMapping.SlideFeedback;

    return newMapping;

  }

  public static HandleScores(questions: QuestionModel[], responses: ResponseModel[], game: GameModel, t: TeamModel, round: RoundModel, subRound: SubRoundModel): SubRoundScore {
    let score = new SubRoundScore();

    let MaxRawScore = 0;
    let RawScore = 0;

    let skipMaxScoreQuestionIds: string[] = [];

    let responsesFound = responses.length > 0;

    questions.forEach(q => {

      let relevantResponses = responses.filter(r => /*!r.SkipScoring && */ r.QuestionId == q._id.toString());
      if (relevantResponses && relevantResponses.length) responsesFound = true;

      if (q.SkipScoring) {
        skipMaxScoreQuestionIds.push(q._id);
      }

      relevantResponses.forEach(r => {
        RawScore += r.Score;

        if (r.SkipScoring || q.SkipScoring) {
          skipMaxScoreQuestionIds.push(q._id);
          MaxRawScore += r.MaxScore;
        }

      });

      if (skipMaxScoreQuestionIds.indexOf(q._id) == -1) {
        ((q.PossibleAnswers as SliderValueObj[]).forEach(a => {
          if (a.maxPoints) MaxRawScore += a.maxPoints;
        }))
      }


    })

    if (responsesFound) {

      let srs = Object.assign(score, {
        TeamId: t._id,
        RawScore,
        MaxRawScore,
        GameId: game._id,
        RoundId: subRound.RoundId,
        SubRoundId: subRound._id,
        SubRoundNumber: subRound.Label,
        SubRoundLabel: subRound.ScoreLabel ? subRound.ScoreLabel : subRound.Label,
        RoundLabel: round.Label,
        TeamLabel: "Team " + t.Number.toString()
      });


      if (RawScore > 0) {

        //console.log(srs.SubRoundLabel.toLowerCase());
        //  console.log(srs.NormalizedScore); 
        if (srs.SubRoundLabel.toLowerCase() == '1a') {
          //srs.NormalizedScore = RawScore / MaxRawScore * (.2 * 20);
        } else if (srs.SubRoundLabel.toLowerCase() == '1b') {
          //srs.NormalizedScore = RawScore / MaxRawScore * (.8 * 20);                                
        }
        //add bonus points to team that had highest bid
        else {

          srs.NormalizedScore = RawScore / MaxRawScore;

        }
        //console.log(srs.NormalizedScore); 
        srs.NormalizedScore = RawScore / MaxRawScore;
      }

      else {

        srs.NormalizedScore = 0;
      }

    }


    return score;
  }

  public static async getScoresForGame(game: GameModel):Promise<SubRoundScore[]> {

    const mapping = game.CurrentRound

    const subRounds: SubRoundModel[] = await monSubRoundModel.find({ RoundId: mapping.RoundId })
      .populate("Questions")
      .then(srs => srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON()))); //.then()

    const round: RoundModel = await monRoundModel.findOne({Name: mapping.ParentRound.toUpperCase()})
                                .then(r => Object.assign(new RoundModel(), r.toJSON())); //.then()

    const teams: TeamModel[] = await monTeamModel.find({GameId: game._id}).then(r => this.InstantiateModelFromDbCall(r, TeamModel) as TeamModel[])

    //we need the PREVIOUS subround
    const scores: SubRoundScore[] = [];
    let responsesFound = false;
    for (let j = 0; j < subRounds.length; j++) {
      let subRound = subRounds[j];
      //Some subrounds may be unscored
      if (subRound.SkipScoring) continue;
      
      console.log(`getting scores for ${subRound.Name}`)

      for (let i = 0; i < teams.length; i++) {
        let t = teams[i];
        //get the team's responses in this subround
        const responses: ResponseModel[] = await monResponseModel.find(
          { targetObjId: t._id, SubRoundId: subRound._id }).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON())) : null)
        let questions = subRound.Questions;

        //get TEAM_RATING questions. They will be filtered out by rounds that don't have them, since there is no response
        let ratingQuestions = await monQModel.find({ RatingMarker: RatingType.TEAM_RATING }).then(qs => qs ? qs.map(q => Object.assign(new QuestionModel(), q.toJSON(), { SkipScoring: true })) : null)
        questions = questions.concat(ratingQuestions);

        let srs = this.HandleScores(questions, responses, game, t, round, subRound);

        let oldScore: SubRoundScore = await monSubRoundScoreModel.findOne({ TeamId: t._id, SubRoundId: subRound._id }).then(sr => sr ? Object.assign(new SubRoundScore(), sr.toJSON()) : null);
        if (oldScore && oldScore.BonusPoints) srs.NormalizedScore += oldScore.BonusPoints;
        let savedSubRoundScore: SubRoundScore = await monSubRoundScoreModel.findOneAndUpdate({ TeamId: t._id, SubRoundId: subRound._id }, srs, { upsert: true, new: true, setDefaultsOnInsert: true }).then(sr => Object.assign(new SubRoundScore(), sr.toJSON()));
        scores.push(savedSubRoundScore)
      }
    }

    return scores//.filter(s => s.TeamLabel && s.TeamLabel != null);

  }

  public static InstantiateModelFromDbCall(dbReturn: MongooseDocument | MongooseDocument[], type: typeof BaseModel): (BaseModel | BaseModel[]) {

    if (!dbReturn || !(dbReturn as Array<MongooseDocument>)) return null;

    if (Array.isArray(dbReturn)) {
      return dbReturn.map(r => Object.assign(new type(), r.toJSON()));
    } else {
      return Object.assign(new type(), dbReturn.toJSON());
    }

  }
}
