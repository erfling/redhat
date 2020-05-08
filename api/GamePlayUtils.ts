import { JobName } from "./../shared/models/UserModel";
import { monMappingModel } from "./controllers/GameCtrl";
import {
  monRoundModel,
  monSubRoundModel,
  monQModel,
} from "./controllers/RoundCtrl";
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
import {
  monResponseModel,
  monSubRoundScoreModel,
} from "./controllers/GamePlayCtrl";
import { monTeamModel } from "./controllers/TeamCtrl";

export default class GamePlayUtils {
  public static async HandleRoundChange(
    passedMapping: RoundChangeMapping,
    game: GameModel
  ): Promise<RoundChangeMapping> {
    let mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), {
      ...passedMapping,
    });

    let rounds: RoundModel[] = await monRoundModel
      .find({ IsActive: true })
      .populate("SubRounds")
      .sort({ Weight: 1 })
      .then((roundDocs) => {
        return roundDocs.map(
          (roundDoc) =>
            ({ ...new RoundModel(), ...roundDoc.toJSON() } as RoundModel)
        );
      });

    //Pick role for each player on each team
    //TODO: get rid of magic string
    mapping.UserJobs = {};

    mapping.ParentRound = mapping.ParentRound.toLowerCase();
    mapping.ChildRound = mapping.ChildRound.toLowerCase();

    const round = await monRoundModel
      .findById(mapping.RoundId)
      .then((r) => r.toJSON());
    let srModel: SubRoundModel = await monSubRoundModel
      .findById(mapping.SubRoundId)
      .then((x) => x.toJSON());

    let SubRoundLabel: String = srModel.Label.toString().toUpperCase();
    let newMapping: RoundChangeMapping;

    console.log("RELEVANT SUBROUND IS: ", SubRoundLabel);
    let RoundId = round._id;
    mapping.RoundId = round._id;

    console.log(
      "Roundchange mapping: as curried",
      mapping.ShowFeedback,
      mapping.SlideFeedback,
      passedMapping.ShowFeedback,
      passedMapping.SlideFeedback,
      mapping.RoundId,
      rounds[1]._id
    );

    //make sure the current mapping has the correct child round
    var oldMapping: RoundChangeMapping = await monMappingModel
      .findOneAndUpdate(
        { GameId: game._id, RoundId: mapping.SubRoundId },
        {
          ChildRound: mapping.ChildRound,
          ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
          ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
          ShowIndividualFeedback: mapping.ShowIndividualFeedback,
          SlideFeedback: mapping.SlideFeedback,
          RoundId,
          SlideNumber: mapping.SlideNumber,
        },
        { new: true },
        function (err, doc) {
          if (err) {
            console.log("Something wrong when updating data!", err);
          }
        }
      )
      .then((r) =>
        r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null
      );

    //Determine if an event should be sent to players or if the new mapping only reflects a change in slide presentation
    let advanceGame = true;
    if (
      oldMapping &&
      oldMapping.SubRoundId == mapping.SubRoundId &&
      oldMapping.ShowFeedback == mapping.ShowFeedback &&
      oldMapping.ShowIndividualFeedback == mapping.ShowIndividualFeedback &&
      oldMapping.ShowRateUsers == mapping.ShowRateUsers
    ) {
      //in cases where only a slide is advanced, and we shouldn't see a gameplay change, all the above props will be unchanged.
      //the only change we expect is to mapping/oldMapping.SlideNumber
      console.log("SKIPPING ADVANCE");
      advanceGame = false;
    }

    if (!oldMapping) {
      console.log("no old mapping");
      if (mapping.ParentRound.toLowerCase() == "engineeringround") {
        console.log("ENGINEERING ROUND ADVANCE EDGE CASE");
        game.Teams.forEach((t) => {
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
      }
      //first real gameplay.
      else if (JSON.stringify(RoundId) === JSON.stringify(rounds[1]._id)) {
        console.log(
          "matched round id to first round of gameplay",
          RoundId,
          rounds[1]._id
        );
        game.Teams.forEach((t) => {
          //we are in the first true round of gameplay. Each teams first player should be manager
          let managerPlayerId = t.Players[0]._id.toString();
          mapping.UserJobs[managerPlayerId] = JobName.MANAGER;
          game.HasBeenManager.push(managerPlayerId);
        });
      } else {
        console.log("OLD MAPPING ELSE");

        //Get an old mapping for the current round and game
        //If we've already assigned roles for this round, we should use the old mapping's UserJobs
        let oldMappingForThisRound = await monMappingModel
          .findOne({
            RoundId,
            GameId: game._id
          })
          .then((r) =>
            r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null
          );

        //set another manager
        let roundNumber = Number(round.Label);
        console.log(
          "HAD USER JOBS FOR",
          roundNumber,
          RoundId,
          rounds[1]._id,
          RoundId !== rounds[1]._id,
          JSON.stringify(RoundId) !== JSON.stringify(rounds[1]._id)
        );
        game.Teams.forEach((t) => {
          //   console.log("TEAM ", t)
          let teamPids = [];
          for (let i = 0; i < t.Players.length; i++) {
            let pid = t.Players[i].toString();
            teamPids.push(pid);
            if (i == roundNumber - 2) {
              console.log(
                `SETTING PLAYER ${pid} (${t.Players[i].Email}) as MANAGER`
              );
              if (game.HasBeenManager.indexOf(pid) === -1) {
                mapping.UserJobs[pid] = JobName.MANAGER;
                game.HasBeenManager.push(pid);
              }
            }
          }
          //make sure each team has a manager, even if all the team members have been manager
          if (
            //If a manager has already been assinged in this round, use the same UserJobs map
            oldMappingForThisRound &&
            oldMappingForThisRound.UserJobs &&
            teamPids.some(
              (pid) => oldMappingForThisRound.UserJobs[pid] === JobName.MANAGER
            )
          ) {
            //😂😂😂😂😂😂
            let managerId = teamPids.find((pid) => oldMappingForThisRound.UserJobs[pid] === JobName.MANAGER);
            console.log("FOUND A MANAGER IN THE PREVIOUS MAPPING", managerId)
            mapping.UserJobs[managerId] = JobName.MANAGER;
          }
          //Assign a random manager if no manager has been assigned for this round.
          else {
            console.log("SETTING RANDOM PLAYER AS MANAGER")
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
        .then((r) => Object.assign(new RoundChangeMapping(), r.toJSON()));
    }
    //the first round change should not trigger a jobs update if there are already jobs
    else if (!oldMapping.UserJobs) {
      console.log("old mapping but no jobs");

      let roundNumber = Number(round.Label);

      game.Teams.forEach((t) => {
        for (let i = 0; i < t.Players.length; i++) {
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            mapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every((p) => {
            return mapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
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
      game.Teams.forEach((t) => {
        oldMapping.UserJobs[t.Players[1].toString()] = JobName.BLUE_KITE;
      });

      newMapping = oldMapping;
    } else {
      console.log("OLD MAPPING ELSE");

      let roundNumber = Number(round.Label);

      console.log("HAD MAPPING WITH JOBS");
      game.Teams.forEach((t) => {
        for (let i = 0; i < t.Players.length; i++) {
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            oldMapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every((p) => {
            return oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
          oldMapping.UserJobs[
            t.Players[
              Math.floor(Math.random() * t.Players.length)
            ]._id.toString()
          ] = JobName.MANAGER;
        }
      });
      newMapping = oldMapping;
    }

    mapping.GameId = game._id;

    if ((!newMapping || !newMapping.ParentRound.length) && !oldMapping) {
      throw new Error("Couldn't make mapping");
    }

    if (!newMapping) newMapping = passedMapping;

    newMapping.ShowFeedback = passedMapping.ShowFeedback;
    newMapping.SlideFeedback = passedMapping.SlideFeedback;

    console.log("returning mapping, so we made it here");
    return newMapping;
  }

  public static HandleScores(
    questions: QuestionModel[],
    responses: ResponseModel[],
    game: GameModel,
    t: TeamModel,
    round: RoundModel,
    subRound: SubRoundModel
  ): SubRoundScore {
    console.log("HANDLING SCORES IN UTILS");

    let score = new SubRoundScore();

    let MaxRawScore = 0;
    let RawScore = 0;

    let skipMaxScoreQuestionIds: string[] = [];

    let responsesFound = responses.length > 0;

    questions.forEach((q) => {
      let relevantResponses = responses.filter(
        (r) => /*!r.SkipScoring && */ r.QuestionId == q._id.toString()
      );
      if (relevantResponses && relevantResponses.length) responsesFound = true;

      if (q.SkipScoring) {
        skipMaxScoreQuestionIds.push(q._id);
      }

      relevantResponses.forEach((r) => {
        RawScore += r.Score;

        if (r.SkipScoring || q.SkipScoring) {
          skipMaxScoreQuestionIds.push(q._id);
          MaxRawScore += r.MaxScore;
        }
      });

      if (skipMaxScoreQuestionIds.indexOf(q._id) == -1) {
        (q.PossibleAnswers as SliderValueObj[]).forEach((a) => {
          if (a.maxPoints) MaxRawScore += a.maxPoints;
        });
      }
    });

    if (responsesFound) {
      console.log("FOUND SOME RESPONSES");
      let srs = Object.assign(score, {
        TeamId: t._id,
        RawScore,
        MaxRawScore,
        GameId: game._id,
        RoundId: subRound.RoundId,
        SubRoundId: subRound._id,
        SubRoundNumber: subRound.Label,
        SubRoundLabel: subRound.ScoreLabel
          ? subRound.ScoreLabel
          : subRound.Label,
        RoundLabel: round.Label,
        TeamLabel: "Team " + t.Number.toString(),
      });

      if (RawScore > 0) {
        //console.log(srs.SubRoundLabel.toLowerCase());
        //  console.log(srs.NormalizedScore);
        if (srs.SubRoundLabel.toLowerCase() == "1a") {
          //srs.NormalizedScore = RawScore / MaxRawScore * (.2 * 20);
        } else if (srs.SubRoundLabel.toLowerCase() == "1b") {
          //srs.NormalizedScore = RawScore / MaxRawScore * (.8 * 20);
        }
        //add bonus points to team that had highest bid
        else {
          srs.NormalizedScore = RawScore / MaxRawScore;
        }
        //console.log(srs.NormalizedScore);
        srs.NormalizedScore = RawScore / MaxRawScore;
      } else {
        srs.NormalizedScore = 0;
      }
    }

    console.log(score);
    return score;
  }

  public static async getScoresForGame(
    game: GameModel
  ): Promise<SubRoundScore[]> {
    const mapping = game.CurrentRound;
    console.log("IS THIS EVEN GETTING CALLED?", mapping);

    const round: RoundModel = await monRoundModel
      .findOne({ Name: mapping.ParentRound.toUpperCase() })
      .then((r) => Object.assign(new RoundModel(), r.toJSON()));

    const subRounds: SubRoundModel[] = await monSubRoundModel
      .find({ RoundId: round._id })
      .populate("Questions")
      .then((srs) =>
        srs.map((sr) => Object.assign(new SubRoundModel(), sr.toJSON()))
      ); //.then()

    //.then()

    const teams: TeamModel[] = await monTeamModel
      .find({ GameId: game._id })
      .then(
        (r) => this.InstantiateModelFromDbCall(r, TeamModel) as TeamModel[]
      );

    //we need the PREVIOUS subround
    const scores: SubRoundScore[] = [];
    let responsesFound = false;
    console.log("HEY!!!!!", subRounds);

    for (let j = 0; j < subRounds.length; j++) {
      console.log("HEY!!!!!", j);
      let subRound = subRounds[j];
      console.log("getting scores for", subRound.Name);

      //Some subrounds may be unscored
      if (subRound.SkipScoring) continue;

      for (let i = 0; i < teams.length; i++) {
        let t = teams[i];
        //get the team's responses in this subround
        const responses: ResponseModel[] = await monResponseModel
          .find({ targetObjId: t._id, SubRoundId: subRound._id })
          .then((rs) =>
            rs
              ? rs.map((r) => Object.assign(new ResponseModel(), r.toJSON()))
              : null
          );
        let questions = subRound.Questions;

        //get TEAM_RATING questions. They will be filtered out by rounds that don't have them, since there is no response
        let ratingQuestions = await monQModel
          .find({ RatingMarker: RatingType.TEAM_RATING })
          .then((qs) =>
            qs
              ? qs.map((q) =>
                  Object.assign(new QuestionModel(), q.toJSON(), {
                    SkipScoring: true,
                  })
                )
              : null
          );
        questions = questions.concat(ratingQuestions);

        let srs = this.HandleScores(
          questions,
          responses,
          game,
          t,
          round,
          subRound
        );

        let oldScore: SubRoundScore = await monSubRoundScoreModel
          .findOne({ TeamId: t._id, SubRoundId: subRound._id })
          .then((sr) =>
            sr ? Object.assign(new SubRoundScore(), sr.toJSON()) : null
          );
        if (oldScore && oldScore.BonusPoints)
          srs.NormalizedScore += oldScore.BonusPoints;
        let savedSubRoundScore: SubRoundScore = await monSubRoundScoreModel
          .findOneAndUpdate({ TeamId: t._id, SubRoundId: subRound._id }, srs, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          })
          .then((sr) => Object.assign(new SubRoundScore(), sr.toJSON()));
        scores.push(savedSubRoundScore);
      }
    }

    return scores; //.filter(s => s.TeamLabel && s.TeamLabel != null);
  }

  public static InstantiateModelFromDbCall(
    dbReturn: MongooseDocument | MongooseDocument[],
    type: typeof BaseModel
  ): BaseModel | BaseModel[] {
    if (!dbReturn || !(dbReturn as Array<MongooseDocument>)) return null;

    if (Array.isArray(dbReturn)) {
      return dbReturn.map((r) => Object.assign(new type(), r.toJSON()));
    } else {
      return Object.assign(new type(), dbReturn.toJSON());
    }
  }
}
