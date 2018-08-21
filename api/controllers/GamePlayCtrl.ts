import { monUserModel } from './UserCtrl';
import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import { monTeamModel } from './TeamCtrl';
import ValueObj, { SliderValueObj } from '../../shared/entity-of-the-state/ValueObj';
import { monQModel, monSubRoundModel, monRoundModel } from './RoundCtrl';
import SubRoundModel from '../../shared/models/SubRoundModel';
import { monGameModel } from './GameCtrl';
import TeamModel from '../../shared/models/TeamModel';
import GameModel from '../../shared/models/GameModel';
import QuestionModel, { QuestionType, ComparisonLabel } from '../../shared/models/QuestionModel';
import { groupBy } from 'lodash';
import UserModel, { JobName } from '../../shared/models/UserModel';
import FeedBackModel from '../../shared/models/FeedBackModel';
import { ValueDemomination } from '../../shared/models/SubRoundFeedback';
import { RatingType } from '../../shared/models/QuestionModel';
import SubRoundScore from '../../shared/models/SubRoundScore';
import { AppServer } from '../AppServer';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import RoundModel from '../../shared/models/RoundModel';

const schObj = SchemaBuilder.fetchSchema(ResponseModel);
const monSchema = new mongoose.Schema(schObj);
export const monResponseModel = mongoose.model("response", monSchema);

const subRoundScoreSchema = SchemaBuilder.fetchSchema(SubRoundScore);
const monSubRoundScoreSchema = new mongoose.Schema(subRoundScoreSchema);
export const monSubRoundScoreModel = mongoose.model("subroundscore", monSubRoundScoreSchema);


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
            console.log("SHOULD IGNORE SCOING IF ROUND 4", response);
            const question = await monQModel.findById(response.QuestionId).then(q => q.toJSON());

            if (!response.SkipScoring) {

                console.log(question);
                if (question.Type != QuestionType.TEXTAREA) {
                    response.Score = response.resolveScore();
                    response.MaxScore = response.resolveMaxScore();
                }
            }

            let queryObj: any = { GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }

            if (response.TargetTeamId) queryObj.TargetTeamId = response.TargetTeamId;
            if (response.TargetUserId) queryObj.TargetUserId = response.TargetUserId;

            const oldResponse = await monResponseModel.findOne(queryObj).then(r => r ? r.toJSON() : null);

            console.log("HEY!!!!", oldResponse);
            if (!oldResponse) {
                delete response._id;
                response.questionText = question.Text;
                var SaveResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
            } else {
                delete response._id;
                var SaveResponse = await monResponseModel.findOneAndUpdate({ questionText: question.Text, GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }, response, { new: true }).then(r => r.toObject() as ResponseModel);
            }
            console.log(SaveResponse);

            res.json(SaveResponse);
        } catch (err) {
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
            res.status(500)
                .json("no sir");
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

    public async GetGameResponsesBySubround(req: Request, res: Response) {
        try {
            let GameId = req.params.gameid;
            let SubRoundId = req.params.subroundid;

            const responses = await monResponseModel.find({ GameId, SubRoundId });

            if (!responses) throw new Error("NO RESPONSES");
            res.json(responses);
        }
        catch (err) {
            console.log(err)
            res.status(500).send("couldn't get responses")
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
                AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", response.GameId, gameForUpdate.CurrentRound);


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
            let question: QuestionModel = await monQModel.findOne({ RatingMarker: RatingType.MANAGER_RATING })
                .then(q => q ? Object.assign(new QuestionModel(), q.toJSON()) : null);

            let mgr = players.filter(p => jobMap[p._id.toString()] == JobName.MANAGER)[0];
            let finalQuestions: QuestionModel[] = players.map(p => {
                //build the manager question
                let job: JobName = jobMap[p._id.toString()];
                //if(jobMap[p._id.toString()] == JobName.MANAGER){
                let q: QuestionModel = JSON.parse(JSON.stringify(question))
                q.PossibleAnswers = question.PossibleAnswers.map(pa => {
                    return Object.assign({}, pa, {
                        idealValue: 0,
                        maxPoints: 3,
                        minPoints: 1,
                        min: 0,
                        max: 10,
                        data: "5",
                        targetObjId: p._id.toString(),
                        targetObjClass: "UserModel",
                        targetObjName: p.Name,
                        category: (pa as any).Round || null
                    })
                })
                q.RatingMarker = jobMap[p._id.toString()] == JobName.MANAGER ? RatingType.MANAGER_RATING : RatingType.IC_RATING;
                q.SubText = jobMap[p._id.toString()] == JobName.MANAGER ? "How did " + p.Name + " perform as a manager?" : "How did " + p.Name + " do this round?";
                q.Text = jobMap[p._id.toString()] != JobName.MANAGER && "";
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
        try {

            const question = await monQModel.findById(response.QuestionId).then(q => q.toJSON())

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

                    var oldResponse = await monResponseModel.findOne({

                        targetObjId: rating.targetObjId,
                        targetObjClass: rating.targetObjClass,
                        SubRoundId: rating.SubRoundId,
                        QuestionId: rating.QuestionId

                    }).then(r => r ? r.toJSON() : null);

                    if (oldResponse) {
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
                let answers = response.Answer as SliderValueObj[];
                for (var i = 0; i < answers.length; i++) {
                    let ans = answers[i];
                    console.dir("HHHHHHHHHHHEEEEEEEEEEEEEEEEEEEEEEEEEEYYYYYYYYYYYYY", response)
                    let queryObj: any = { DisplayLabel: ans.label, SubRoundId: response.SubRoundId, GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId, targetObjId: (response.Answer as SliderValueObj[])[0].targetObjId }

                    const oldResponse = await monResponseModel.findOne(queryObj).then(r => r ? r.toJSON() : null);
                    let r = Object.assign({}, response);
                    r.targetObjClass = "UserModel";
                    r.targetObjId = (response.Answer as SliderValueObj[])[0].targetObjId;
                    r.DisplayLabel = ans.label;
                    r.Answer = (r.Answer as SliderValueObj[]).filter(pa => pa.label == ans.label);
                    r.Score = Number(ans.data || 0);
                    if (!oldResponse) {
                        delete response._id;
                        var SaveResponse = await monResponseModel.create(r).then(r => r.toObject() as ResponseModel);
                    } else {
                        delete response._id;
                        var SaveResponse = await monResponseModel.findOneAndUpdate(queryObj, r, { new: true }).then(r => r.toObject() as ResponseModel);
                    }
                    console.log(SaveResponse);

                }

            }

            res.json(response)

        } catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't save response for priotires")
        }
    }


    /**
     * Returnss all Subround scores with the given ID
     * @param req 
     * @param res 
     */
    public async getSubRoundScores(req: Request, res: Response) {

        const Name = req.params.subroundid.toUpperCase();
        const GameId = req.params.gameid;
        try {
            const subround: SubRoundModel = await monSubRoundModel.findOne({Name}).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null)
            let SubRoundLabel = subround.Label;
            console.log("{  GameId: %s,}", GameId);

            var roundScores: SubRoundScore[] = await monSubRoundScoreModel.find({ GameId })
                .then(srs => srs ? srs.map(
                    b => Object.assign(new SubRoundScore(), b.toJSON())) : []);


            console.log(roundScores);
            if (!roundScores) throw new Error();
            roundScores = roundScores.filter(rs => {
                console.log(rs.RoundLabel, SubRoundLabel, rs.RoundLabel <= SubRoundLabel);
                return rs.RoundLabel <= SubRoundLabel;
            });
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

            const game: GameModel = await monGameModel.findById(GameId).then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null)
            let mapping: RoundChangeMapping = game.CurrentRound;

            console.log(game, mapping)

            const subround: SubRoundModel = await monSubRoundModel.findOne({Name: mapping.ChildRound.toUpperCase()}).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null)
            const round: RoundModel = await monRoundModel.findById(subround.RoundId).then(sr => sr ? Object.assign(new RoundModel(), sr.toJSON()) : null)

            let RoundId = round._id;
            let SubRoundId = subround._id;
            //get all teams' responses for the round, then group them by team
            const responses: ResponseModel[] = await monResponseModel.find({ GameId }).then(responses => responses ? responses.map(b => Object.assign(new ResponseModel(), b.toJSON())) : []);

            const teams: TeamModel[] = await monTeamModel.find({ GameId }).then(t => t ? t.map(team => team.toJSON()) : []);

            //const subround: SubRoundModel = await monSubRoundModel.findById(SubRoundId).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null);

            let groupedResponses = groupBy(responses, "TeamId");

            //console.log(subround);

            var scores = Object.keys(groupedResponses).map(k => {
                let score = new FeedBackModel();

                score.TotalGameScore = groupedResponses[k].reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                }, 0);

                score.TotalRoundScore = groupedResponses[k].filter(r => r.RoundId == RoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                }, 0);

                score.TotalSubroundScore = groupedResponses[k].filter(r => r.SubRoundId == SubRoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                }, 0);

                score.TargetObjectId = k;
                score.Label = "Team " + teams.filter(t => t._id.toString() == k)[0] ? "Team " + teams.filter(t => t._id.toString() == k)[0].Number.toString() : null;
                score.TargetModel = "TeamModel";

                score.TeamsFeedBack = subround ? subround.FeedBack : null;

                //special case for round three feedback
                if (subround && subround.Name == "DEALRENEWAL" || subround.Name == "DEALSTRUCTURE") {
                    let round3Response = groupedResponses[k].filter(r => r.SubRoundId == SubRoundId)[0];

                    let posOrNeg;
                    if (round3Response) {
                        for (let i = 0; i < (round3Response.Answer as SliderValueObj[]).length; i++) {
                            let ans = (round3Response.Answer as SliderValueObj[])[i];

                            if (ans.label == ComparisonLabel.CSAT && Number(ans.data) >= 90) {
                                //team gets positive feedback, so we filter out negative
                                posOrNeg = ValueDemomination.POSITIVE;

                            } 
                            
                            if (ans.label == ComparisonLabel.PRICE_PER_CUSTOMER && Number(ans.data) >= 750) {
                                //team gets negative feedback, so we filter out positive
                                posOrNeg = ValueDemomination.NEGATIVE;
                            }
                        }
                    }

                    score.TeamsFeedBack = score.TeamsFeedBack.filter(fb => fb.ValueDemomination != posOrNeg);
                }

                return score;
            });

            scores = scores.sort((s1, s2) => {
                return s1.TotalGameScore != s2.TotalGameScore ? s1.TotalGameScore > s2.TotalGameScore ? 1 : -1 : 0;
            })


            res.json(scores);
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get scores")
        }
    }

    public async getUserScores(req: Request, res: Response) {
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
                }, 0);

                score.TotalRoundScore = groupedResponses[k].filter(r => r.RoundId == RoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                }, 0);

                score.TotalSubroundScore = groupedResponses[k].filter(r => r.SubRoundId == SubRoundId).reduce((totalScore, r: ResponseModel) => {
                    return Number((totalScore + r.Score).toFixed(2));
                }, 0);



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

            scores = scores.sort((s1, s2) => {
                return s1.TotalGameScore != s2.TotalGameScore ? s2.TotalGameScore > s1.TotalGameScore ? 1 : -1 : 0;
            })

            res.json(scores);
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("couldn't get responses")
        }
    }

    public async ReadMessage(req: Request, res: Response) {

        try {
            const userId = req.params.userid;
            const messageId = req.params.messageid;

            let user: UserModel = await monUserModel.findById(userId).then(u => u ? Object.assign(new UserModel(), u.toJSON()) : null);

            if (!user) throw new Error("couldn't get user");
            if (user.ReadMessages.indexOf(messageId) == -1) {
                user.ReadMessages.push(messageId);
                user = await monUserModel.findByIdAndUpdate(userId, { ReadMessages: user.ReadMessages }, { new: true }).then(u => u ? Object.assign(new UserModel(), u.toJSON()) : null);
            }

            res.json(user);
        }
        catch (err) {
            console.log(err);
            res.status(500)
                .send("couldn't mark message read")
        }
    }

    public async GetUserRatingsSoFar(req: Request, res: Response) {
        try {
            const targetObjId = req.params.userid;
            const TeamId = req.params.teamid;

            //let currentSubRound: SubRoundModel = await monSubRoundModel.findById(SubRoundId).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null);
            const team: TeamModel = await monTeamModel.findById(TeamId).then(t => t ? Object.assign(new TeamModel(), t.toJSON()) : null);
            console.log("TEAM BE", team);

            const game = await monGameModel.findById(team.GameId).then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null);
            const currentSubRound = await monSubRoundModel.findOne({Name: game.CurrentRound.ChildRound.toLocaleUpperCase()}).then(s => s ? Object.assign(new SubRoundModel(), s.toJSON()) : null)
            
            if (!currentSubRound) throw new Error("Didn't get subround");

            let subRounds: SubRoundModel[] = await monSubRoundModel.find().then(srs => srs ? srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON())) : null);
            subRounds.sort((a, b) => {
                if (a.Label < b.Label)
                    return -1;
                if (a.Label > b.Label)
                    return 1;
                return 0;
            })
            let responses: ResponseModel[] = await monResponseModel.find({ targetObjId, targetObjClass: "UserModel" }).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON())) : null);
            if (!responses) throw new Error("Didn't get responses");

            // sorted subRoundIds, truncated to include only currentSubRound or before
            let subRoundIds: string[] = subRounds.filter((sr) => {
                console.log("DUDE:", sr.Label, currentSubRound.Label, sr.Label <= currentSubRound.Label, responses);

                return sr.Label <= currentSubRound.Label && responses.filter(r => {
                    console.log("PAINIS", r.RoundId, sr.RoundId, r.RoundId == sr.RoundId);
                    return r.RoundId == sr.RoundId;
                }).length;
            }).map(sr => sr._id);
            console.log(subRoundIds);

            // build array of unique DisplayLabel (rating criteria name) for the responses
            let displayLabels: string[] = responses.reduce((allDisplayLabels: string[], response: ResponseModel) => {
                if (!(response.DisplayLabel in allDisplayLabels)) {
                    allDisplayLabels.push(response.DisplayLabel);
                }
                return allDisplayLabels;
            }, []);

            let orderedResponses: Array<{ [key: string]: ResponseModel[] }> = [];
            // Build orderedResponses based on already sorted subRoundIds, so orderedResponses are sorted too
            for (var n = 0; n < subRoundIds.length; n++) {
                orderedResponses[n] = {};
                displayLabels.forEach(displayName => {
                    orderedResponses[n][displayName] = responses.filter(r => r.SubRoundId == subRoundIds[n] && r.DisplayLabel == displayName);
                })
            }

            res.json(orderedResponses);
        }
        catch (err) {
            console.log(err);
            res.status(500)
                .send("couldn't get user scores")
        }
    }

    public async getFacilitatorResponsesByRound(req: Request, res: Response){
        try{
            const GameId = req.params.gameid;

            const game: GameModel = await monGameModel.findById(GameId).populate("Teams").then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null);

            let mapping: RoundChangeMapping = game.CurrentRound;

            let subround: SubRoundModel = await monSubRoundModel.findOne({Name: mapping.ChildRound.toLocaleUpperCase()}).then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null);

            //get the regular questions for the current roud
            

            //get the player rating questions for the current round
            let responses: ResponseModel[] = await monResponseModel.find({GameId, SubRoundId: subround._id}).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel, r.toJSON())): []);

            let groupedResponses:any = {};

            game.Teams.forEach(t => {
                if (!groupedResponses["Team " + t.Number.toString()]) groupedResponses["Team " + t.Number.toString()] = responses.filter(r => {
                    return r.TeamId == t._id;
                })
                
            })

            res.json(groupedResponses);

        }
        catch(err){
            console.log(err);
            res.status(500)
                .send("couldn't get getFascillitatorResponsesByRound")
        }
    }

    public routes() {
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/responses/:gameid/:subroundid", this.GetGameResponsesBySubround.bind(this));
        this.router.get("/get4bresponses/:gameid", this.getTeamsFor4BRating.bind(this));
        this.router.get("/readmessage/:messageid/:userid", this.ReadMessage.bind(this));
        this.router.post("/rateplayers", this.GetPlayerRatingsQuestions.bind(this));
        this.router.post("/response", this.SaveResponse.bind(this));
        this.router.post("/1bresponse", this.Save1BResponse.bind(this), this.SaveResponse.bind(this));
        this.router.post("/roundresponses", this.GetTeamResponsesByRound.bind(this));
        this.router.post("/bid", this.SubmitBid.bind(this), this.SaveResponse.bind(this));
        this.router.post("/3response", this.SaveRound3Response.bind(this));
        this.router.get("/getscores/:gameid", this.getScores.bind(this)),
            this.router.get("/getuserscores/:subroundid/:roundid/:gameid", this.getUserScores.bind(this)),
            this.router.get("/getsubroundscores/:gameid/:subroundid", this.getSubRoundScores.bind(this)),
            this.router.post("/response/rating", this.savePriorityRating.bind(this)),
            this.router.get("/getuserrating/:userid/:teamid", this.GetUserRatingsSoFar.bind(this))
            this.router.get("/getfacilitatorresponses/:gameid", this.getFacilitatorResponsesByRound.bind(this))
    }
}

export default new GamePlayRouter().router;