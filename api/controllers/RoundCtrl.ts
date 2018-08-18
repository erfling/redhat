import { Label } from 'semantic-ui-react';
import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../SchemaBuilder';
import SubRoundModel from '../../shared/models/SubRoundModel';
import MessageModel from '../../shared/models/MessageModel';
import UserModel, { JobName } from '../../shared/models/UserModel';
import AuthUtils, { PERMISSION_LEVELS } from '../AuthUtils';
import { monResponseModel } from './GamePlayCtrl';
import ResponseModel from '../../shared/models/ResponseModel';
import ValueObj, { SliderValueObj } from '../../shared/entity-of-the-state/ValueObj';
import QuestionModel, { QuestionType, ComparisonLabel } from '../../shared/models/QuestionModel';
import { monGameModel, monMappingModel } from './GameCtrl';
import TeamModel from '../../shared/models/TeamModel';
import GameModel from '../../shared/models/GameModel';
import SubRoundFeedback, { ValueDemomination } from '../../shared/models/SubRoundFeedback';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';

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
subSchObj.Questions = [{ type: mongoose.Schema.Types.ObjectId, ref: "question" }];
subSchObj.LeaderMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.ICMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.ChipCoMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.IntegratedSystemsMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.PrevSubRound = { type: mongoose.Schema.Types.ObjectId, ref: "subround" };
subSchObj.NextSubRound = { type: mongoose.Schema.Types.ObjectId, ref: "subround" };

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
                return res.status(400).json({ error: 'No games' });
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
                res.status(400).json({ error: 'No round' });
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
            let round = await monSubRoundModel.findOne({ Name: ID }).populate("Questions").populate(job);
            if (!round) {
                res.status(400).json({ error: 'No round' });
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


        try {

            let subRound: SubRoundModel = await monSubRoundModel
                .findOne({ Name })
                .populate("Questions")
                .populate("PrevSubRound")
                .populate("NextSubRound")
                .then(r => r ? Object.assign(new SubRoundModel(), r.toJSON()) : null);


            if (!subRound) throw new Error("no subround");


            if (subRound.Name.toUpperCase() == "INTRO" || subRound.Name.toUpperCase() == "PLAYERLOGIN") {
                let messagesIds = subRound[this._getMessageProp(JobName.IC)];
                subRound.DisplayMessages = await monMessageModel.find({ _id: { $in: messagesIds } }).then(messages => messages ? messages.map(m => Object.assign(new MessageModel(), m.toJSON())) : null)
                res.json(subRound);
            } else {

                const subRoundsSoFar = await this.GetPreviousRounds(subRound);
                //console.table("SUBROUNDS SO FAR",subRoundsSoFar)
                const mappings: RoundChangeMapping[] = await monMappingModel.find({ GameId }).then(mappings => mappings ? mappings.map(m => m.toJSON() as RoundChangeMapping) : null)

                if (!mappings) throw new Error("Coulnd't get game mappings");
                //this._getMessageProp(req.params.job);

                

                let messagesIds: MessageModel[] = [];
                let currentMessageIds: string[];
                subRoundsSoFar.forEach((sr, i) => {
                    console.log(sr.Name, " ", sr._id, " ", sr.RoundId, " ");
                    let roundMapping = mappings.filter(m => m.RoundId == sr.RoundId)[0] || null;

                    if (i == 0) {
                        let messages = currentMessageIds = sr[this._getMessageProp(Job)];
                        messagesIds = messagesIds.concat(messages);
                    } else if (roundMapping) {
                        console.log("FOUND SOME CONTENT")
                        let userJob = roundMapping.UserJobs[UserId] ? roundMapping.UserJobs[UserId] : JobName.IC;
                        let messages = []// = sr[this._getMessageProp(userJob)];
                        Object.keys(JobName).forEach((jn)=> {
                            messages = messages.concat(sr[this._getMessageProp(JobName[jn])]);
                        })
                        messagesIds = messagesIds.concat(messages);
                        console.log("SUBROUND IS NOW", subRound);

                    } else {
                        console.log("coulnd't find mapping with round id:", sr.RoundId);
                    }

                })

                //console.log("MESSAGES", messagesIds);

                let populatedMessages = await monMessageModel.find({ _id: { $in: messagesIds } }).then(messages => messages ? messages.map(m => Object.assign(new MessageModel(), m.toJSON())) : null)

                populatedMessages = populatedMessages.map(m => {

                    let IsRead = true;
                    currentMessageIds.forEach(mid => {
                        console.log(mid, m._id, typeof mid, typeof m._id, mid.toString() == m._id.toString())
                        if(mid.toString() == m._id.toString()) IsRead = false;
                    })
                    return Object.assign(m, {
                        IsRead
                    })
                }).sort((a: MessageModel, b: MessageModel) => {
                    if(a.SubRoundLabel == b.SubRoundLabel)return 0;
                    return a.SubRoundLabel > b.SubRoundLabel ? -1 : 1
                })//.reverse();

                subRound.DisplayMessages = populatedMessages;

                if (!subRound || !subRoundsSoFar) {
                    res.status(400).json({ error: 'No round' });
                } else {
                    res.json(subRound);
                }
            }
        } catch (err) {
            res.status(500).json(err);
        }

    }

    public async GetPreviousRounds(subRound: SubRoundModel, subRoundsSoFar: SubRoundModel[] = []): Promise<SubRoundModel[]> {

        if (!subRoundsSoFar) subRoundsSoFar = [];
        let previousSubround: SubRoundModel;
        subRoundsSoFar.push(subRound);
        if (subRound.PrevSubRound) {
            previousSubround = await monSubRoundModel.findById(subRound.PrevSubRound)
                .then(r => r.toJSON() as SubRoundModel);
        } else {
            return subRoundsSoFar;
        }

        return this.GetPreviousRounds(previousSubround, subRoundsSoFar);

    }

    public async GetSubRound3B(req: Request, res: Response): Promise<any> {

        const ID = req.params.subround;
        const TeamId = req.params.TeamId
        const job = this._getMessageProp(req.params.job);

        console.log("3B3B3B3BTRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let round: SubRoundModel = await monSubRoundModel.findOne({ Name: ID }).populate("Questions").populate(job).then(r => r ? Object.assign(new SubRoundModel(), r.toJSON()) : null);
            if (!round) {
                res.status(400).json({ error: 'No round' });
            } else {
                const quantityQuestion = round.Questions.filter(q => q.ComparisonLabel == ComparisonLabel.QUANTITY)[0] || null;

                if (quantityQuestion) {
                    let response: ResponseModel = await monResponseModel.findOne({ QuestionId: quantityQuestion.SiblingQuestionId, TeamId }).then(r => r ? Object.assign(new ResponseModel(), r.toJSON()) : null)

                    //get 3A responses for team
                    //old school for loop because await makes it await
                    if (response) {
                        let matchingAnswer = (response.Answer as SliderValueObj[]).filter(a => a.label == ComparisonLabel.PRICE_PER_CUSTOMER)[0] || null;

                        if (matchingAnswer) {

                            let min = Math.round(200000 * (Math.pow(((matchingAnswer.data) / 466.666666666666666666666666666666666666666666667), -0.5)) / 6000);

                            quantityQuestion.PossibleAnswers[0] = Object.assign(quantityQuestion.PossibleAnswers[0], {
                                min: min,//parseInt((response.Answer as SliderValueObj).data) * ,
                                max: min * 2
                            })
                        }

                        round.Questions = round.Questions.map(q => {
                            return q.ComparisonLabel && q.ComparisonLabel == ComparisonLabel.QUANTITY ? quantityQuestion : q;
                        });

                        res.json(round);

                    } else {
                        throw new Error("COULDN'T FIND MATCHING RESPONSE")
                    }

                } else {
                    throw new Error("COULDN'T FIND MATCHING RESPONSE")
                }

            }
        } catch (err) {
            (err: any) => res.status(500).json({ error: err });
        }

    }

    public async SaveRound(req: Request, res: Response): Promise<any> {
        const roundToSave = req.body as RoundModel;
        console.log(roundToSave, roundToSave.Name, roundToSave.Name.length);

        try {
            if (!roundToSave.Name || !roundToSave.Name.length || !roundToSave._id) {
                console.log("HERE")
                var savedRound = await monRoundModel.create(roundToSave);
            } else {
                var savedRound = await monRoundModel.findOneAndUpdate({ Name: roundToSave.Name }, roundToSave, { new: true })
                console.log(savedRound);
            }
            res.json(savedRound);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Didn't save round")
        }
    }

    public async SaveMessage(req: Request, res: Response): Promise<any> {
        const message = req.body as MessageModel;

        try {
            if (!message._id) {
                console.log("HERE")
                var savedMessage = await monMessageModel.create(message);
            } else {
                var savedMessage = await monMessageModel.findByIdAndUpdate(message._id, message, { new: true })
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

        }
        catch{

        }



    }


    public async SaveSubRound(req: Request, res: Response): Promise<any> {
        const subRoundToSave = req.body as SubRoundModel;
        console.log(subRoundToSave, subRoundToSave.Name, subRoundToSave.Name.length);

        //const dbRoundModel = new monRoundModel(roundToSave); 

        try {
            if (!subRoundToSave.Name || !subRoundToSave.Name.length || !subRoundToSave._id) {
                console.log("HERE")
                var savedRound = await monSubRoundModel.create(subRoundToSave).then(r => r.toObject() as SubRoundModel);
            } else {
                var savedRound = await monSubRoundModel.findOneAndUpdate({ Name: subRoundToSave.Name }, subRoundToSave, { new: true }).then(r => r.toObject() as SubRoundModel);
                console.log(savedRound);
            }

            //Make sure parent round contains subround
            const parentRound = await monRoundModel.findById(savedRound.RoundId).then(r => r.toObject() as RoundModel);
            if (parentRound && parentRound.SubRounds.indexOf(savedRound._id)) {
                parentRound.SubRounds.push(savedRound._id);
                console.log(monRoundModel)
                const saveParentRound = await monRoundModel.findByIdAndUpdate(savedRound.RoundId, parentRound)
            }

            res.json(savedRound);
        }
        catch{
            res.send("couldn't save the round")
        }
    }

    public async GetRound3FeedBack(req: Request, res: Response) {
        console.log("called it")
        const GameId = req.params.gameid;
        const RoundId = req.params.roundid;

        try {
            //get all the teams in the game
            const game: GameModel = await monGameModel.findById(GameId).populate('Teams').then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null)
            console.log("FOUDN THIS GAME", game)
            //get all the response for the relevant round in this game
            const responses = await monResponseModel.find({ GameId, RoundId }).then(r => r ? r.map(resp => Object.assign(new ResponseModel(), resp.toJSON())) : null);
            console.log("FOUDN THESE RESPONSES", responses);

            let teamsWithResponses: TeamModel[];
            if (responses) {
                teamsWithResponses = game.Teams.map(t => {
                    t.Responses = responses.filter(r => r.TeamId == t._id.toString())
                    return t;
                });
            } else {
                teamsWithResponses = game.Teams;
            }

            if (!teamsWithResponses) throw new Error("painis");

            res.json(teamsWithResponses)

        } catch (err) {
            console.log(err)
            res.send("couldn't build response list")
        }


    }

    public async SaveFeedback(req: Request, res: Response, next: NextFunction) {
        const feedBack = req.body as SubRoundFeedback;

        try {

            let savedFeedback;
            if (!feedBack._id) {
                savedFeedback = await monFeedbackModel.create(feedBack).then(r => r ? Object.assign(new SubRoundFeedback(), r.toJSON()) : null)
                //update our subround
                const sr: SubRoundModel = await monSubRoundModel.findById(savedFeedback.RoundId).populate("Feedback").then(r => r.toJSON());

                sr.FeedBack.push(savedFeedback);
                sr.FeedBack = sr.FeedBack.sort(fb => {
                    if (fb.ValueDemomination == ValueDemomination.NEUTRAL) return -1;

                    return fb.ValueDemomination == ValueDemomination.POSITIVE ? 1 : 0;
                }).map(fb => fb._id);

                const updatedSr = await monSubRoundModel.findByIdAndUpdate(savedFeedback.RoundId, sr);


            } else {
                savedFeedback = await monFeedbackModel.findByIdAndUpdate(feedBack._id, feedBack).then(r => r ? Object.assign(new SubRoundFeedback(), r.toJSON()) : null)
            }

            if (!savedFeedback) throw new Error("Couldn't save feedback");

            res.json(savedFeedback);

        }
        catch (err) {
            console.log(err);
            res.status(500).send("couldn't save the feedback")
        }
    }

    private _getMessageProp(job: JobName): keyof UserModel {
        switch (job) {
            case JobName.MANAGER:
                return 'LeaderMessages'
            case JobName.CHIPCO:
                return 'ChipCoMessages'
            case JobName.INTEGRATED_SYSTEMS:
                return 'IntegratedSystemsMessages'
            case JobName.BLUE_KITE:
                return 'BlueKiteMessages'
            default:
                return 'ICMessages'
        }
    }

    public routes() {
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/:round", this.GetRound.bind(this));
        this.router.get("/subround/:subround/:gameid/:userid/:job", this.GetMessages.bind(this));
        this.router.get("/subround/:subround/:job/:TeamId", this.GetSubRound3B.bind(this));
        this.router.post("/",
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER),
            this.SaveRound.bind(this)
        );
        this.router.post("/savefeedback",
        
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
            this.SaveFeedback.bind(this)
        );
        this.router.get("/round3responses/:gameid/:roundid",
            //(req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.GetRound3FeedBack.bind(this)
        );
        this.router.post("/subround",
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER),
            this.SaveSubRound.bind(this)
        );
        this.router.post("/message",
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER),
            this.SaveMessage.bind(this)
        );
    }
}

export default new RoundRouter().router;