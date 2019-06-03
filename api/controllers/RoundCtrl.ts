import { Slider } from "react-semantic-ui-range";
import { Label } from "semantic-ui-react";
import { Router, Request, Response, NextFunction } from "express";
import * as mongoose from "mongoose";
import RoundModel from "../../shared/models/RoundModel";
import SchemaBuilder from "../SchemaBuilder";
import SubRoundModel from "../../shared/models/SubRoundModel";
import MessageModel from "../../shared/models/MessageModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import AuthUtils, { PERMISSION_LEVELS } from "../AuthUtils";
import { monResponseModel } from "./GamePlayCtrl";
import ResponseModel from "../../shared/models/ResponseModel";
import ValueObj, {
  SliderValueObj
} from "../../shared/entity-of-the-state/ValueObj";
import QuestionModel, {
  QuestionType,
  ComparisonLabel
} from "../../shared/models/QuestionModel";
import { monGameModel, monMappingModel } from "./GameCtrl";
import TeamModel from "../../shared/models/TeamModel";
import GameModel from "../../shared/models/GameModel";
import SubRoundFeedback, {
  ValueDemomination
} from "../../shared/models/SubRoundFeedback";
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import * as Passport from "passport";
import { monTeamModel } from "./TeamCtrl";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";
import { monRoundChangeLookupModel } from "./FacilitationCtrl";
import { sortBy, orderBy } from "lodash";
import { monUserModel } from "./UserCtrl";

const messageSchObj = SchemaBuilder.fetchSchema(MessageModel);
const monMessageSchema = new mongoose.Schema(messageSchObj);
export const monMessageModel = mongoose.model("message", monMessageSchema);

const feedBackSchemaObj = SchemaBuilder.fetchSchema(SubRoundFeedback);
const monFeedbackSchema = new mongoose.Schema(feedBackSchemaObj);
export const monFeedbackModel = mongoose.model("feedback", monFeedbackSchema);

const schObj = SchemaBuilder.fetchSchema(RoundModel);
schObj.SubRounds = [{ type: mongoose.Schema.Types.ObjectId, ref: "subround" }];
schObj.PrevRound = { type: mongoose.Schema.Types.ObjectId, ref: "round" };
schObj.NextRound = { type: mongoose.Schema.Types.ObjectId, ref: "round" };

//consider leaving content off default queries
//schObj.Content = { type: String, select: false }

const monSchema = new mongoose.Schema(schObj);
export const monRoundModel = mongoose.model("round", monSchema);

const qSchObj = SchemaBuilder.fetchSchema(QuestionModel);
const qSubSchema = new mongoose.Schema(qSchObj);
export const monQModel = mongoose.model("question", qSubSchema);

const subSchObj = SchemaBuilder.fetchSchema(SubRoundModel);
subSchObj.Questions = [
  { type: mongoose.Schema.Types.ObjectId, ref: "question" }
];
subSchObj.LeaderMessages = [
  { type: mongoose.Schema.Types.ObjectId, ref: "message" }
];
subSchObj.ICMessages = [
  { type: mongoose.Schema.Types.ObjectId, ref: "message" }
];
subSchObj.ChipCoMessages = [
  { type: mongoose.Schema.Types.ObjectId, ref: "message" }
];
subSchObj.IntegratedSystemsMessages = [
  { type: mongoose.Schema.Types.ObjectId, ref: "message" }
];
subSchObj.PrevSubRound = {
  type: mongoose.Schema.Types.ObjectId,
  ref: "subround"
};
subSchObj.NextSubRound = {
  type: mongoose.Schema.Types.ObjectId,
  ref: "subround"
};
//subSchObj.FeedBack = [{ type: mongoose.Schema.Types.ObjectId, ref: "feedback" }];

const monSubSchema = new mongoose.Schema(subSchObj);

export const monSubRoundModel = mongoose.model("subround", monSubSchema);

class RoundRouter {
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

    try {
      let rounds = await monRoundModel.find();
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
    const Name = req.params.round;
    console.log("TRYING TO GET ROUND WITH NAME: ", Name);
    try {
      let round = await monRoundModel.findOne({ Name });
      if (!round) {
        res.status(400).json({ error: "No round" });
      } else {
        res.json(round);
      }
    } catch (err) {
      (err: any) => res.status(500).json({ error: err });
    }
  }

  public async GetSubRound(req: Request, res: Response): Promise<any> {
    const ID = req.params.subround;
    const job = this._getMessageProp(req.params.job);
    console.log("TRYING TO GET ROUND WITH NAME: ", ID);
    try {
      let round = await monSubRoundModel
        .findOne({ Name: ID })
        .populate("Questions")
        .populate(job);
      if (!round) {
        res.status(400).json({ error: "No round" });
      } else {
        res.json(round);
      }
    } catch (err) {
      (err: any) => res.status(500).json({ error: err });
    }
  }

  public async GetMessages(req: Request, res: Response): Promise<any> {
    //TODO: make is so you can get content by job for current round

    const Name = req.params.subround;
    const GameId = req.params.gameid;
    const UserId = req.params.userid;
    const Job = req.params.job;

    if (Name == "INTRO") {
      try {
        const subround = await monSubRoundModel
          .findOne({ Name })
          .then(r => r.toJSON());

        const content = await monMessageModel
          .find({ RoundId: subround._id })
          .then(messages =>
            messages
              ? messages.map(m => Object.assign(new MessageModel(), m.toJSON()))
              : null
          );
          console.log()
      } catch (error) {
        res.status(500);
        res.json("FAILED TO GET CONTENT FOR INTRO");
      }
    } else {
      try {
        const player = (await monUserModel
          .findById(UserId)
          .then(r => r.toJSON())) as UserModel;
        if (!player) throw new Error("no player found");

        const teams: TeamModel[] = await monTeamModel
          .find({ GameId })
          .then(ts =>
            ts ? ts.map(t => Object.assign(new TeamModel(), t.toJSON())) : null
          );
        if (!teams) throw new Error("no teams");
        const team = teams.find(t => {
          console.log(player._id, t.Players, typeof t.Players[0].toString());
          return t.Players.some(id => id.toString() == UserId.toString());
        });

        //get the team so we can add responses to questions that have already been answered
        if (!team) throw new Error("no team found");

        const subRound: SubRoundModel = await monSubRoundModel
          .findOne({ Name })
          .populate("Questions")
          .populate("PrevSubRound")
          .populate("NextSubRound")
          .then(r =>
            r ? Object.assign(new SubRoundModel(), r.toJSON()) : null
          );

        //get a small list of responses that could match each question to avoid multiple queries
        const responses: ResponseModel[] = await monResponseModel
          .find({ TeamId: team._id, SubRoundId: subRound._id })
          .then(rs =>
            rs
              ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON()))
              : null
          );

        console.log("responses", responses);

        subRound.Questions = subRound.Questions.map(q => {
          let qWithR = { ...q } as QuestionModel;
          qWithR.Response =
            responses.find(r => r.QuestionId == q._id) || q.Response;
          return qWithR;
        });

        if (!subRound) throw new Error("no subround");

        if (
          subRound.Name.toUpperCase() == "INTRO" ||
          subRound.Name.toUpperCase() == "PLAYERLOGIN"
        ) {
          let messagesIds = subRound[this._getMessageProp(JobName.IC)];
          subRound.DisplayMessages = await monMessageModel
            .find({ _id: { $in: messagesIds } })
            .then(messages =>
              messages
                ? messages.map(m =>
                    Object.assign(new MessageModel(), m.toJSON())
                  )
                : null
            );
          res.json(subRound);
        } else {
          const subRoundsSoFar = await this.GetPreviousRounds(subRound);
          console.table("SUBROUNDS SO FAR", subRoundsSoFar);
          const mappings: RoundChangeMapping[] = await monMappingModel
            .find({ GameId })
            .then(mappings =>
              mappings
                ? mappings.map(m => m.toJSON() as RoundChangeMapping)
                : null
            );

          if (!mappings) throw new Error("Coulnd't get game mappings");
          //this._getMessageProp(req.params.job);

          let messagesIds: MessageModel[] = [];
          let currentMessageIds: string[];
          subRoundsSoFar.forEach((sr, i) => {
            console.log(sr.Name, " ", sr._id, " ", sr.RoundId, " ");
            let roundMapping =
              mappings.filter(m => m.RoundId == sr.RoundId)[0] || null;

            if (i == 0) {
              let messages = (currentMessageIds =
                sr[this._getMessageProp(Job)]);
              messagesIds = messagesIds.concat(messages);
            } else if (roundMapping) {
              console.log("FOUND SOME CONTENT");
              let userJob = roundMapping.UserJobs[UserId]
                ? roundMapping.UserJobs[UserId]
                : JobName.IC;
              let messages = []; // = sr[this._getMessageProp(userJob)];
              Object.keys(JobName).forEach(jn => {
                messages = messages.concat(
                  sr[this._getMessageProp(JobName[jn])]
                );
              });
              messagesIds = messagesIds.concat(messages);
              //console.log("SUBROUND IS NOW", subRound);
            } else {
              console.log(
                "coulnd't find previously accessed mapping for this game with round id:",
                sr.RoundId
              );
            }
          });

          //console.log("MESSAGES", messagesIds);

          let populatedMessages = await monMessageModel
            .find({ _id: { $in: messagesIds } })
            .then(messages =>
              messages
                ? messages.map(m =>
                    Object.assign(new MessageModel(), m.toJSON())
                  )
                : null
            );

          populatedMessages = populatedMessages
            .map(m => {
              let IsRead = true;
              currentMessageIds.forEach(mid => {
                //console.log(mid, m._id, typeof mid, typeof m._id, mid.toString() == m._id.toString())
                if (mid.toString() == m._id.toString()) IsRead = false;
              });
              return Object.assign(m, {
                IsRead
              });
            })
            .sort((a: MessageModel, b: MessageModel) => {
              if (a.SubRoundLabel == b.SubRoundLabel) return 0;
              return a.SubRoundLabel > b.SubRoundLabel ? -1 : 1;
            }); //.reverse();

          subRound.DisplayMessages = populatedMessages;

          if (!subRound || !subRoundsSoFar) {
            res.status(400).json({ error: "No round" });
          } else {
            console.log(subRound.Name);

            //special case, add message with 1A resposne for player reference
            if (subRound.Name == "HIRING") {
              console.log("IN HIRING ROUND");
              const round1A: SubRoundModel = await monSubRoundModel
                .findOne({ Name: "PRIORITIES" })
                .then(sr =>
                  sr ? { ...new SubRoundModel(), ...sr.toJSON() } : null
                );
              if (round1A) {
                console.log("GOT ROUND 1A", round1A._id);
                let query = { TeamId: team._id, SubRoundId: round1A._id };
                console.log(query);
                const responses: ResponseModel[] = await monResponseModel
                  .find(query)
                  .then(rs =>
                    rs
                      ? rs.map(r =>
                          Object.assign(new ResponseModel(), r.toJSON())
                        )
                      : null
                  );

                if (responses) {
                  console.log(responses);
                  const getOrderedAnswers = (answers: SliderValueObj[]) => {
                    if (!answers) return `<></>`;
                    return orderBy(answers)
                      .map(a => `<p class="push-left">${a.label}</p>`)
                      .join(" ");
                  };

                  let extraMessage = new MessageModel();
                  extraMessage.SubRoundLabel = "1B";
                  extraMessage.RoundId = round1A._id;
                  extraMessage.Title = "Your Priorities";
                  extraMessage.Job = Job;
                  extraMessage._id = "IGNORE_ME";
                  extraMessage.Content =
                    `<h2 style={{marginTop:"30px"}}>As a reminder, you prioritized your criteria in the following order:</h2>` +
                    responses
                      .map(r => {
                        console.log(r.questionText);
                        return (
                          `<h2 style={{marginTop:"20px"}}>` +
                          r.questionText +
                          `</h2>` +
                          getOrderedAnswers(r.Answer as SliderValueObj[])
                        );
                      })
                      .join(" ");

                  console.log("GOT ROUND 1A", extraMessage);
                  subRound.DisplayMessages.push(extraMessage);
                }
              }
            }

            res.json(subRound);
          }
        }
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  }

  public async GetPreviousRounds(
    subRound: SubRoundModel,
    subRoundsSoFar: SubRoundModel[] = []
  ): Promise<SubRoundModel[]> {
    if (!subRoundsSoFar) subRoundsSoFar = [];
    let previousSubround: SubRoundModel;
    subRoundsSoFar.push(subRound);
    if (subRound.PrevSubRound) {
      previousSubround = await monSubRoundModel
        .findById(subRound.PrevSubRound)
        .then(r => r.toJSON() as SubRoundModel);
    } else {
      return subRoundsSoFar;
    }

    return this.GetPreviousRounds(previousSubround, subRoundsSoFar);
  }

  public async GetSubRound3B(req: Request, res: Response): Promise<any> {
    try {
      const GameId = req.params.gameid;

      //do this a better way.
      const SubRound = await monSubRoundModel
        .findOne({ Name: "DEALRENEWAL" })
        .then(r => (r ? r.toJSON() : null));
      if (!SubRound) throw new Error("No subuound found");

      //get all the teams
      let teams: TeamModel[] = await monTeamModel
        .find({ GameId })
        .then(ts =>
          ts ? ts.map(t => Object.assign(new TeamModel(), t.toJSON())) : null
        );

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

      teams.map(t => {
        finalQuestions = finalQuestions.concat(
          questions.map(q => {
            return Object.assign({}, q, {
              Type: QuestionType.NUMBER,
              Text: "Team " + t.Number,
              TargetTeamId: t._id,
              test: "adsf",
              targetObjId: t._id,
              targetObjClass: "TeamModel",
              PossibleAnswers: [
                {
                  label: "Team " + t.Number,
                  unit: "%",
                  maxPoints: 1,
                  minPoints: 0,
                  idealValue: "100",
                  increment: 1,
                  max: 100,
                  min: 0,
                  targetObjId: t._id,
                  targetObjClass: "TeamModel"
                }
              ]
            });
          })
        );
      });

      SubRound.Questions = finalQuestions;
      res.json(SubRound);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send("couldn't get questions");
    }
  }

  public async SaveRound(req: Request, res: Response): Promise<any> {
    const roundToSave = req.body as RoundModel;
    console.log(roundToSave, roundToSave.Name, roundToSave.Name.length);

    try {
      if (!roundToSave.Name || !roundToSave.Name.length || !roundToSave._id) {
        console.log("HERE");
        var savedRound = await monRoundModel.create(roundToSave);
      } else {
        var savedRound = await monRoundModel.findOneAndUpdate(
          { Name: roundToSave.Name },
          roundToSave,
          { new: true }
        );
        console.log(savedRound);
      }
      res.json(savedRound);
    } catch (err) {
      console.log(err);
      res.status(500).json("Didn't save round");
    }
  }

  public async SaveMessage(req: Request, res: Response): Promise<any> {
    const message = req.body as MessageModel;

    try {
      if (!message._id) {
        console.log("HERE");
        var savedMessage = await monMessageModel.create(message);
      } else {
        var savedMessage = await monMessageModel.findByIdAndUpdate(
          message._id,
          message,
          { new: true }
        );
      }
      res.json(savedMessage);

      //do we need to update a SubRound?
      /*const sr = await monSubRoundModel.findById(message.RoundId).then(r => r ? Object.assign(new SubRoundModel, r) : null);

            if(sr){
                const prop = this._getMessageProp(message.Job);
                if(prop && sr[prop]){
                    sr[prop] = sr[prop].filter(id => id != message._id).concat(message._id);
                    req.body = sr;
                    await this.SaveSubRound(req, res);
                }
            }*/
    } catch {}
  }

  public async SaveSubRound(req: Request, res: Response): Promise<any> {
    const subRoundToSave = req.body as SubRoundModel;
    console.log(
      subRoundToSave,
      subRoundToSave.Name,
      subRoundToSave.Name.length
    );

    //const dbRoundModel = new monRoundModel(roundToSave);

    try {
      if (
        !subRoundToSave.Name ||
        !subRoundToSave.Name.length ||
        !subRoundToSave._id
      ) {
        console.log("HERE");
        var savedRound = await monSubRoundModel
          .create(subRoundToSave)
          .then(r => r.toObject() as SubRoundModel);
      } else {
        var savedRound = await monSubRoundModel
          .findOneAndUpdate({ Name: subRoundToSave.Name }, subRoundToSave, {
            new: true
          })
          .then(r => r.toObject() as SubRoundModel);
        console.log(savedRound);
      }

      //Make sure parent round contains subround
      const parentRound = await monRoundModel
        .findById(savedRound.RoundId)
        .then(r => r.toObject() as RoundModel);
      if (parentRound && parentRound.SubRounds.indexOf(savedRound._id)) {
        parentRound.SubRounds.push(savedRound._id);
        console.log(monRoundModel);
        const saveParentRound = await monRoundModel.findByIdAndUpdate(
          savedRound.RoundId,
          parentRound
        );
      }

      res.json(savedRound);
    } catch {
      res.send("couldn't save the round");
    }
  }

  public async GetRound3FeedBack(req: Request, res: Response) {
    console.log("called it");
    const GameId = req.params.gameid;
    //const RoundId = req.params.roundid;

    try {
      //get all the teams in the game
      const game: GameModel = await monGameModel
        .findById(GameId)
        .populate("Teams")
        .then(g => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      let mapping: RoundChangeMapping = game.CurrentRound;
      let round: RoundModel = await monRoundModel
        .findOne({ Name: mapping.ParentRound.toUpperCase() })
        .then(r => (r ? Object.assign(new RoundModel(), r.toJSON()) : null));
      console.log("FOUDN THIS GAME", game);
      //get all the response for the relevant round in this game
      const responses = await monResponseModel
        .find({ GameId, RoundId: round._id })
        .then(r =>
          r
            ? r.map(resp => Object.assign(new ResponseModel(), resp.toJSON()))
            : null
        );
      console.log("FOUDN THESE RESPONSES", responses);

      let teamsWithResponses: TeamModel[];
      if (responses) {
        teamsWithResponses = game.Teams.map(t => {
          t.Responses = responses.filter(r => r.TeamId == t._id.toString());
          return t;
        });
      } else {
        teamsWithResponses = game.Teams;
      }

      if (!teamsWithResponses) throw new Error("painis");

      res.json(teamsWithResponses);
    } catch (err) {
      console.log(err);
      res.send("couldn't build response list");
    }
  }

  public async SaveFeedback(req: Request, res: Response, next: NextFunction) {
    const feedBack = req.body as SubRoundFeedback;

    try {
      let savedFeedback: SubRoundFeedback[];
      let subRound: SubRoundModel = await monSubRoundModel
        .findById(feedBack.RoundId)
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );
      if (!subRound) throw new Error("Cound't get subround");

      subRound.FeedBack = [feedBack];

      let savedSubRound = await monSubRoundModel
        .findByIdAndUpdate(subRound._id, subRound, { new: true })
        .then(sr =>
          sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null
        );

      console.log("SAVED: ", savedSubRound);
      savedFeedback = savedSubRound.FeedBack;
      if (!savedFeedback) throw new Error("Couldn't save feedback");

      res.json(savedFeedback);
    } catch (err) {
      console.log(err);
      res.status(500).send("couldn't save the feedback");
    }
  }

  public async createSlideMappings(req: Request, res: Response) {
    try {
      let deletedLookup = await monRoundChangeLookupModel.remove({});
      let allSubRounds: SubRoundModel[] = await monSubRoundModel
        .find()
        .then(srs =>
          srs
            ? srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON()))
            : null
        );
      if (!allSubRounds) throw new Error("no subrounds");

      let srs = sortBy(allSubRounds, "Label");

      let lookups: RoundChangeLookup[] = [];
      let slideNumber = 1;
      for (let i = 0; i < srs.length; i++) {
        let sr = srs[i];
        let r: RoundModel = await monRoundModel
          .findById(sr.RoundId)
          .then(r => (r ? Object.assign(new RoundModel(), r.toJSON()) : null));

        console.log("CREATING LOOKUP FOR", sr.Label);

        let lookup = new RoundChangeLookup();
        lookup.Round = r.Name;
        lookup.SubRound = sr.Name;
        lookup.RoundId = r._id;
        lookup.SubRoundId = sr._id;

        for (let x = 0; x < 4; x++) {
          lookup.MaxSlideNumber = slideNumber;
          lookup.MinSlideNumber = slideNumber;

          //1A, 2A and 4A are special cases with no feedback
          if (
            sr.Label.toLocaleUpperCase() != "1A" &&
            sr.Label.toLocaleUpperCase() != "2A" &&
            sr.Label.toLocaleUpperCase() != "4A"
          ) {
            lookup.ShowFeedback = x == 1;
          }

          //only the last subround in each round gets user ratings
          if (i == r.SubRounds.length - 1) {
            lookup.ShowRateUsers = x == 2;
            lookup.ShowIndividualFeedback = x == 3;
          }

          console.log(lookup);
          let savedLookup: RoundChangeLookup = await monRoundChangeLookupModel
            .create(lookup)
            .then(rcl =>
              rcl ? Object.assign(new RoundChangeLookup(), rcl.toJSON()) : null
            );

          if (!savedLookup)
            throw new Error("Couldn't save lookup for " + sr.Label);

          lookups.push(savedLookup);
          slideNumber++;
        }
      }

      res.json(lookups);
    } catch (err) {
      console.log(err);
      res.status(500).json("failed");
    }
  }

  private _getMessageProp(job: JobName): keyof UserModel {
    switch (job) {
      case JobName.MANAGER:
        return "LeaderMessages";
      case JobName.CHIPCO:
        return "ChipCoMessages";
      case JobName.INTEGRATED_SYSTEMS:
        return "IntegratedSystemsMessages";
      case JobName.BLUE_KITE:
        return "BlueKiteMessages";
      default:
        return "ICMessages";
    }
  }

  public routes() {
    //this.router.all("*", cors());
    this.router.get("/", this.GetRounds.bind(this));
    this.router.get("/:round", this.GetRound.bind(this));
    this.router.get(
      "/subround/:subround/:gameid/:userid/:job",
      this.GetMessages.bind(this)
    );
    this.router.get("/get2bquestions/:gameid", this.GetSubRound3B.bind(this));
    this.router.post(
      "/",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER),
      this.SaveRound.bind(this)
    );
    this.router.post(
      "/savefeedback",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
      this.SaveFeedback.bind(this)
    );
    this.router.get(
      "/round3responses/:gameid",
      //(req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER),
      this.GetRound3FeedBack.bind(this)
    );
    this.router.post(
      "/subround",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
      this.SaveSubRound.bind(this)
    );
    this.router.post(
      "/message",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
      this.SaveMessage.bind(this)
    );

    //this.router.get("/changes/makeroundchanges", this.createSlideMappings.bind(this))
  }
}

export default new RoundRouter().router;
