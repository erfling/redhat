import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import { monTeamModel } from './TeamCtrl';
import ValueObj, { SliderValueObj } from '../../shared/entity-of-the-state/ValueObj';
import { monQModel, monSubRoundModel } from './RoundCtrl';
import SubRoundModel from '../../shared/models/SubRoundModel';
import { monGameModel } from './GameCtrl';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import TeamModel from '../../shared/models/TeamModel';
import Game from '../../client/game/Game';
import GameModel from '../../shared/models/GameModel';
import QuestionModel, { QuestionType } from '../../shared/models/QuestionModel';
import { groupBy } from 'lodash';
import { Label } from 'semantic-ui-react';
import UserModel, { JobName } from '../../shared/models/UserModel';
import { RatingType } from '../../shared/models/QuestionModel';

const schObj = SchemaBuilder.fetchSchema(ResponseModel);
const monSchema = new mongoose.Schema(schObj);
export const monResponseModel = mongoose.model("response", monSchema);

class GamePlayRouter {
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
        }, 1)
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

        const ID = req.params.round;
        console.log("TRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let round = await monTeamModel.findOne({ Name: ID });
            if (!round) {
                res.status(400).json({ error: 'No round' });
            } else {
                res.json(round);
            }
        } catch (err) {
            (err: any) => res.status(500).json({ error: err });
        }

    }

    public async SaveResponse(req: Request, res: Response) {
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try {
            const question = await monQModel.findById(response.QuestionId).then(q => q.toJSON());

            if (question.Type != QuestionType.TEXTAREA) {
                response.Score = response.resolveScore();
            }

            let queryObj: any = { GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }

            if (response.TargetTeamId) queryObj.TargetTeamId = response.TargetTeamId;
            if (response.TargetUserId) queryObj.TargetUserId = response.TargetUserId;

            const oldResponse = await monResponseModel.findOne(queryObj).then(r => r ? r.toJSON() : null);

            console.log("HEY!!!!", oldResponse);
            if (!oldResponse) {
                delete response._id;
                var SaveResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
            } else {
                var SaveResponse = await monResponseModel.findOneAndUpdate({ GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }, response, { new: true }).then(r => r.toObject() as ResponseModel);
            }
            console.log(SaveResponse);

            res.json(SaveResponse);
        } catch {

        }
    }

    //Special case, since 1b responses depend on 1A responses
    public async Save1BResponse(req: Request, res: Response, next) {
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try {
            //get 1A response for comparison
            const OneAResponse: ResponseModel = await monResponseModel.findOne({
                GameId: response.GameId,
                TeamId: response.TeamId,
                QuestionId: response.SiblingQuestionId
            }).then(r => Object.assign(new ResponseModel(), r.toJSON()));
            console.log("RESPONSE", response, OneAResponse);
            
            //get the possible answer matching our response
            const question: QuestionModel = await monQModel.findById(response.QuestionId).then(r => Object.assign(new QuestionModel(), r.toJSON()));
            var bestCandidate: ValueObj;
            // for each of question's possibleAnswers (which are the candidates for the job)...
            question.PossibleAnswers.forEach(pa => {
                var skillScore = 0;
                // for each candidate's data (which maps which skills they're best at)
                if (pa.data && Array.isArray(pa.data)) {
                    (pa.data as any[]).forEach(paData => {
                        if (paData.data != undefined && !isNaN(paData.data)) {
                            // find what index the skill was ranked in 1a's response
                            var OneAPriorityIndex = (OneAResponse.Answer as ValueObj[]).findIndex(ans => ans.label == paData.Label);
                            if (OneAPriorityIndex > -1) {
                                // Add to candidate's skill score according to skill priority provided in 1a.
                                // So, the 1st priority has a skill score of the number of priorities (7), the 2nd has a skill score of number of priorities - 1 (6), etc.
                                skillScore += paData.data * ((OneAResponse.Answer as ValueObj[]).length - OneAPriorityIndex);
                            }
                        }
                    })
                    pa["skillScore"] = skillScore;
                    if (!bestCandidate || bestCandidate["skillScore"] < skillScore) {
                        // store best candidate so far, according to skillScore
                        bestCandidate = pa;
                    }
                } else {
                    console.log("DOOKIE:", pa);
                }
            });
            
            // set response answer's idealValues based on whether thay're the best candidate
            (response.Answer as ValueObj[]).forEach(ans => {
                ans.idealValue = String(ans.label == bestCandidate.label);
            });

            // Now that response object has idealValues, calculate its score as you would and other multiple-choice
            response.Score = response.resolveScore();

            /*if ((response.Answer as ValueObj).label == question.PossibleAnswers[0].label) {
                req.body.Score = 4;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[1].label) {
                req.body.Score = question.PossibleAnswers[1].Distance == question.PossibleAnswers[0].Distance1 ? 4 : 1;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[2].label) {
                req.body.Score = question.PossibleAnswers[2].Distance == question.PossibleAnswers[1].Distance1 ? 1 : 0;
            }*/
            
            next();
        } catch (err) {
            console.log(err);
            res.status(500);
            res.json("no sir");
        }
    }

    public async GetTeamResponsesByRound(req: Request, res: Response) {
        const fetcher = req.body as ResponseFetcher;
        try {
            const responses = await monResponseModel.find({ TeamId: fetcher.TeamId, GameId: fetcher.GameId, RoundId: fetcher.RoundId }).then(r => r.map(resp => resp.toObject() as ResponseModel))
            res.json(responses)
        } catch (err) {
            res.json(err)
        }
    }

    public async SaveRound3Response(req: Request, res: Response) {
        const subround: SubRoundModel = Object.assign(new SubRoundModel(), req.body as SubRoundModel);
        console.log(subround);
        try {

            let questions = subround.Questions;
            for (let i = 0; i < questions.length; i++) {
                let response = questions[i].Response;

            }

            res.json();
        }
        catch{

        }
    }

    public async SubmitBid(req: Request, res: Response, next) {
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try {
            //get all the responses to determine if this is the highest
            const bids: ResponseModel[] = await monResponseModel.find({ GameId: response.GameId, QuestionId: response.QuestionId }).then(bids => bids ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);
            console.log("found these bids")
            const submittedBidValue = parseFloat(response.Answer[0].data);
            let foundHigherBid = false;
            for (let i = 0; i < bids.length; i++) {
                let bid = bids[i];

                if (parseFloat(bid.data) >= submittedBidValue) {
                    foundHigherBid = true;
                    break;
                }
            }


            if (!foundHigherBid) {
                const team: TeamModel = await monTeamModel.findById(response.TeamId).then(t => t ? Object.assign(new TeamModel(), t.toJSON()) : null)

                console.log("BID IS", submittedBidValue)

                const CurrentHighestBid: Partial<ValueObj> = {
                    data: submittedBidValue.toString(),
                    label: team.Number.toString()
                }


                const game = await monGameModel.findById(team.GameId).then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null)

                let gameForUpdate = Object.assign(game, { CurrentRound: Object.assign(game.CurrentRound, { CurrentHighestBid }) })

                const updatedGame = await monGameModel.findByIdAndUpdate(team.GameId, gameForUpdate);
            }

            next();

        } catch (err) {
            console.log(err);
            res.status(500)
            res.send("couldnt do bid")
        }
    }

    public async getTeamsFor4BRating(req: Request, res: Response) {


        try {

            const GameId = req.params.gameid;

            //do this a better way.
            const RoundId = await monSubRoundModel.findOne({ Name: "PRICING" }).then(r => r ? r._id : null)
            if (!RoundId) throw new Error("No subuound found");

            const responses: ResponseModel[] = await monResponseModel.find({ GameId, RoundId }).then(r => r ? r.map(r => Object.assign(new ResponseModel(), r.toJSON())) : []);

            if (!responses || !responses.length) throw new Error("No responses found")

            //group the responses by team
            let groupedResponses = groupBy(responses, "TeamId");

            //get the questions for this round.
            let questions: QuestionModel[] = await monQModel.find({ RatingMarker: "TEAM_RATING" }).then(q => q ? q.map(quest => Object.assign(new QuestionModel, quest.toJSON())) : []);

            //now map over the responses, building out questions for each team.
            let finalQuestions: QuestionModel[] = [];

            Object.keys(groupedResponses).map(k => {
                console.log(groupedResponses[k]);

                let bidResponse = groupedResponses[k].filter(r => r.Answer && r.Answer[0] && r.Answer[0].label && r.Answer[0].label.toUpperCase() == "PRICING")[0] || null;
                let rationaleResponsee = groupedResponses[k].filter(r => r.Answer && r.Answer[0] && r.Answer[0].label && r.Answer[0].label.toUpperCase() == "EXPLANATION")[0] || null;

                finalQuestions = finalQuestions.concat(
                    questions.map(q => {
                        return Object.assign(q, {

                            Text: q.Text + " " + groupedResponses[k][0].TeamNumber + " bid" + bidResponse.Answer[0].preunit + bidResponse.Answer[0].data + bidResponse.Answer[0].unit,
                            TargetTeamId: k,
                            SubText: rationaleResponsee ? rationaleResponsee.Answer[0].data : "",
                            test: "adsf"
                        })
                    })
                )
            });

            res.json(finalQuestions);

        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }

    }

    public async GetPlayerRatingsQuestions(req: Request, res: Response) {


        try {

            const team: TeamModel = Object.assign(new TeamModel(), req.body);


            //get the game so we can determine which players is the manager
            const game: GameModel = await monGameModel.findById(team.GameId).then(g => g ? g.toJSON() : null)
            if (!game) throw new Error("no game");
            let jobMap = game.CurrentRound.UserJobs;

            //get the players so we can rate each one
            const players: UserModel[] = await monTeamModel.findById(team._id).populate("Players").then(t => t ? t.toObject().Players.map(p => Object.assign(new UserModel(), p)) : null)

            //get the id of the current subround
            const subround = await monSubRoundModel.findOne().then(r => r ? r.toJSON() : null)
            if (!subround) throw new Error("no subround");
            //get the individual rating questions
            let questions: QuestionModel[] = await monQModel.find()
                .where('RatingMarker')
                .in([RatingType.IC_RATING, RatingType.MANAGER_RATING])
                .then(qs => qs ? qs.map(q => Object.assign(new QuestionModel(), q.toJSON())) : null);

            let finalQuestions = questions.map(q => {
                //let job: JobName = jobMap[p._id.toString()];

                //let marker: RatingType = job == JobName.MANAGER ? RatingType.MANAGER_RATING : RatingType.IC_RATING;


                if (q.RatingMarker == RatingType.MANAGER_RATING){
                    let mgr = players.filter(p => jobMap[p._id.toString()] == JobName.MANAGER)[0];
                    return Object.assign(q, {
                        SubText: "How did " + mgr.Name + " perform as a manager?",
                        PossibleAnswers:  q.PossibleAnswers.map((pa, i) => Object.assign( pa, 
                            {
                                    label: mgr.Name + "_" + i,
                                    idealValue: '0',
                                    maxScore: 3,
                                    minScore: 1,
                                    min: 0,
                                    max: 10,
                                    targetObjId: mgr._id.toString(),
                                    targetObjClass: "User"
                            })
                        )
                            
                    })
                }
                //chipco and integrated systems players get the same questions as ICs
                else{
                    return Object.assign(q, {
                        PossibleAnswers: players.filter(p => jobMap[p._id.toString()] != JobName.MANAGER).map((p,i) => {
                            return {
                                label: p.Name,
                                idealValue: '0',
                                maxScore: 3,
                                minScore: 1,
                                targetObjId: p._id.toString(),
                                targetObjClass: "User",
                                data: i
                            }
                        })
                    })
                }


                return q;
            })     

            res.json(finalQuestions);

        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }

    }

    public async getScores(req: Request, res: Response){
        try{

            const RoundId = req.params.roundid;
            const GameId = req.params.GameId;

            //get all teams' responses for the round, then group them by team
            const responses: ResponseModel[] = await monResponseModel.find({ RoundId, QuestionId: GameId }).then(bids => bids ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);


            let groupedResponses = groupBy(responses, "TeamId");



            //sum the scores for all responses
            


            //put scores into proper format for client consumption

        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }
    }

    public routes() {
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/get4bresponses/:gameid", this.getTeamsFor4BRating.bind(this));
        this.router.post("/rateplayers", this.GetPlayerRatingsQuestions.bind(this));
        this.router.post("/response", this.SaveResponse.bind(this));
        this.router.post("/1bresponse", this.Save1BResponse.bind(this), this.SaveResponse.bind(this));
        this.router.post("/roundresponses", this.GetTeamResponsesByRound.bind(this));
        this.router.post("/bid", this.SubmitBid.bind(this), this.SaveResponse.bind(this));
        this.router.post("/3response", this.SaveRound3Response.bind(this));

    }
}

export default new GamePlayRouter().router;