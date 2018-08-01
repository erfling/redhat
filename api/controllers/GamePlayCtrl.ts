import { monUserModel } from './UserCtrl';
import { Type } from 'class-transformer';
import { Slider } from 'react-semantic-ui-range';
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
import FeedBackModel from '../../shared/models/FeedBackModel';

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
            console.log("SHOULD IGNORE SCOING IF ROUND 4", response)
            if(!response.SkipScoring){
                const question = await monQModel.findById(response.QuestionId).then(q => q.toJSON());

                console.log(question);
                if (question.Type != QuestionType.TEXTAREA) {
                    response.Score = response.resolveScore();
                }
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
                delete response._id;
                var SaveResponse = await monResponseModel.findOneAndUpdate({ GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }, response, { new: true }).then(r => r.toObject() as ResponseModel);
            }
            console.log(SaveResponse);

            res.json(SaveResponse);
        } catch (err){
            console.log("ERROR SAVING RESPONSE", err)
            res.status(500);
            res.send("response not saved")
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
            const responses = await monResponseModel.find({ TeamId: fetcher.TeamId, GameId: fetcher.GameId, SubRoundId: fetcher.SubRoundId }).then(r => r.map(resp => resp.toObject() as ResponseModel))
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
            const SubRoundId = await monSubRoundModel.findOne({ Name: "PRICING" }).then(r => r ? r._id : null)
            if (!SubRoundId) throw new Error("No subuound found");

            const responses: ResponseModel[] = await monResponseModel.find({ GameId, SubRoundId }).then(r => r ? r.map(r => Object.assign(new ResponseModel(), r.toJSON())) : []);

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
                let rationaleResponse = groupedResponses[k].filter(r => r.Answer && r.Answer[0] && r.Answer[0].label && r.Answer[0].label.toUpperCase() == "EXPLANATION")[0] || null;



                finalQuestions = finalQuestions.concat(
                    questions.map(q => {
                        return Object.assign(q, {

                            Text: q.Text + " " + rationaleResponse.TeamNumber + " bid" + " $" + bidResponse.Answer[0].data + " Bil.",
                            TargetTeamId: k,
                            SubText: rationaleResponse ? rationaleResponse.Answer[0].data : "",
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
                                    idealValue: 0,
                                    maxPoints: 3,
                                    minPoints: 1,
                                    min: 0,
                                    max: 10,
                                    targetObjId: mgr._id.toString(),
                                    targetObjClass: "UserModel"
                            })
                        )
                    })
                } else {
                    //chipco and integrated systems players get the same questions as ICs
                    return Object.assign(q, {
                        PossibleAnswers: players.filter(p => jobMap[p._id.toString()] != JobName.MANAGER).map((p,i) => {
                            return {
                                label: p.Name,
                                idealValue: 0,
                                maxPoints: 3,
                                minPoints: 1,
                                targetObjId: p._id.toString(),
                                targetObjClass: "UserModel",
                                data: i
                            }
                        })
                    })
                }

                return q;
            })     

            res.json(finalQuestions);

        } catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }
    }

    public async savePriorityRating(req: Request, res: Response, next: NextFunction) {
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);
        try{

            const question = await monQModel.findById(response.QuestionId).then(q => q.toJSON())
                
            const answers: SliderValueObj[] = response.Answer as SliderValueObj[];

            if(question.Type == QuestionType.PRIORITY){

                for(let i = 0; i < answers.length; i++){
                    let answer = answers[i];
                    let rating: ResponseModel = new ResponseModel();

                    rating = Object.assign(response, {Answer: []});
                    delete rating._id;
                    rating.targetObjClass = "UserModel";
                    rating.targetObjId = answer.targetObjId;
                    rating.DisplayLabel = question.Text;
                    rating.Score = answers.length - i;

                    var oldResponse = await monResponseModel.findOne({

                            targetObjId: rating.targetObjId, 
                            targetObjClass: rating.targetObjClass,
                            SubRoundId: rating.SubRoundId,
                            QuestionId: rating.QuestionId

                        }).then(r => r ? r.toJSON() : null);

                    if(oldResponse){
                        console.log("UPDATING OLD RESPONSE")
                        await monResponseModel.findOneAndUpdate({

                            targetObjId: rating.targetObjId, 
                            targetObjClass: rating.targetObjClass,
                            SubRoundId: rating.SubRoundId,
                            QuestionId: rating.QuestionId

                        }, rating).then(r => r ? r.toJSON() : null);
                    } else {
                        await monResponseModel.create(rating)
                    }


                }
            } else {
                let queryObj: any = { GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }

                const oldResponse = await monResponseModel.findOne(queryObj).then(r => r ? r.toJSON() : null);
    
                response.targetObjClass = "UserModel";
                response.targetObjId = (response.Answer as SliderValueObj[])[0].targetObjId;
                response.DisplayLabel = question.Text;

                console.log("HEY!!!!", response);


    
                if (!oldResponse) {
                    delete response._id;
                    var SaveResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
                } else {
                    delete response._id;
                    var SaveResponse = await monResponseModel.findOneAndUpdate({ GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }, response, { new: true }).then(r => r.toObject() as ResponseModel);
                }
                console.log(SaveResponse);
    
            }

            res.json(response)
            /*
            var olderMasterResponse = await monResponseModel.findOne({
                    SubRoundId: response.SubRoundId,
                    QuestionId: response.QuestionId

                }).then(r => r ? r.toJSON() : null);

            if(olderMasterResponse){
                console.log("UPDATING OLD RESPONSE")
                var newResposne = await monResponseModel.findOneAndUpdate({
                    SubRoundId: response.SubRoundId,
                    QuestionId: response.QuestionId

                }, response).then(r => r ? r.toJSON() : null);
            } else {
                var newResposne = await monResponseModel.create(response).then(r => r ? r.toJSON() : null);
            }

            if (newResposne) res.json(newResposne);
            */
        }catch(err){
            console.log(err);
            res.status(500);
            res.send("couldn't save response for priotires")
        }
    }

    public async getScores(req: Request, res: Response){
        try {
            const SubRoundId = req.params.subroundid;
            const RoundId = req.params.roundid;
            const GameId = req.params.gameid;

            //get all teams' responses for the round, then group them by team
            const responses: ResponseModel[] = await monResponseModel.find({ GameId }).then(bids => bids ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);

            const teams: TeamModel[] = await monTeamModel.find({GameId}).then(t => t ? t.map(team => team.toJSON()) : []);

            let groupedResponses = groupBy(responses, "TeamId");

            console.log(groupedResponses);

            var scores = Object.keys(groupedResponses).map(k => {
                let score = new FeedBackModel();
                
                score.TotalGameScore = groupedResponses[k].reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);

                score.TotalRoundScore = groupedResponses[k].filter(r => r.RoundId == RoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);

                score.TotalSubroundScore = groupedResponses[k].filter(r => r.SubRoundId == SubRoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);

                score.TargetObjectId = k;
                score.Label = "Team " + teams.filter(t => t._id.toString() == k)[0].Number.toString();
                score.TargetModel = "TeamModel";

                return score;
            });

            scores = scores.sort((s1,s2) => {
                return s1.TotalGameScore != s2.TotalGameScore ? s1.TotalGameScore > s2.TotalGameScore ? 1 : -1 : 0;
            })

            res.json(scores);
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }
    }

    public async getUserScores(req: Request, res: Response){
        try {
            const SubRoundId = req.params.subroundid;
            const RoundId = req.params.roundid;
            const GameId = req.params.gameid;
            const targetObjClass = "UserModel";

            //get all teams' responses for the round, then group them by team
            const responses: ResponseModel[] = await monResponseModel.find({ GameId, targetObjClass }).then(bids => bids ? bids.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);
            const users: UserModel[] = await monUserModel.find().then(users => users ? users.map(user => user.toJSON()) : []);

            let groupedResponses = groupBy(responses, "targetObjId");

            console.log(groupedResponses);
            var scores = Object.keys(groupedResponses).map(k => {

                let score = new FeedBackModel();

                score.TotalGameScore = groupedResponses[k].reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);

                score.TotalRoundScore = groupedResponses[k].filter(r => r.RoundId == RoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);

                score.TotalSubroundScore = groupedResponses[k].filter(r => r.SubRoundId == SubRoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                },0);


                
                let user = Object.assign(new UserModel(), users.filter(u => u._id.toString() == k)[0])

                score.TargetObjectId = k;
                score.Label = user.Name;
                score.TargetModel = "UserModel";
                
                score.IndividualFeedBack = [];
                groupedResponses[k].filter(r => r.RoundId == RoundId).map(r => {
                    console.log("response!!!!!!!!!!!", r)
                    score.IndividualFeedBack.push(r);
                    return r;
                });
                return score;        
            });

            scores = scores.sort((s1,s2) => {
                return s1.TotalGameScore != s2.TotalGameScore ? s2.TotalGameScore > s1.TotalGameScore ? 1 : -1 : 0;
            })

            res.json(scores);
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
        this.router.get("/getscores/:subroundid/:roundid/:gameid", this.getScores.bind(this)),
        this.router.get("/getuserscores/:subroundid/:roundid/:gameid", this.getUserScores.bind(this)),
        this.router.post("/response/rating", this.savePriorityRating.bind(this))
    }
}

export default new GamePlayRouter().router;