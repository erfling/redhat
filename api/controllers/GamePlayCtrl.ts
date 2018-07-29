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
            response.Score = response.resolveScore();

            const oldResponse = await monResponseModel.findOne({ GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }).then(r => r ? r.toJSON() : null);

            console.log("HEY!!!!", oldResponse);
            if (!oldResponse) {
                var SaveResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
            } else {
                var SaveResponse = await monResponseModel.findOneAndUpdate({ GameId: response.GameId, TeamId: response.TeamId, QuestionId: response.QuestionId }, response, { new: true }).then(r => r.toObject() as ResponseModel);
            }
            console.log(SaveResponse);

            res.json(SaveResponse);
        }
        catch{

        }
    }

    //Special case, since 1b responses depend on 1A responses
    public async Save1BResponse(req: Request, res: Response, next) {
        console.log("WE DONE CALLED THIS")
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try {

            //get 1A response for comparison
            const OneAResponse = await monResponseModel.findOne({
                GameId: response.GameId,
                TeamId: response.TeamId,
                QuestionId: response.SiblingQuestionId
            }).then(r => Object.assign(new ResponseModel(), r.toObject()));


            //get the possible answer matching our response
            const question = await monQModel.findById(response.QuestionId).then(r => Object.assign(new ResponseModel(), r.toObject()));
            console.log("RESPONSE", response, OneAResponse);
            //score 

            question.PossibleAnswers = (question.PossibleAnswers as ValueObj[]).map((pa, i) => {
                let total: number = 0;
                //find out how far each possible answer is from the 1AResponse
                OneAResponse.Answer.forEach((a, j) => {
                    total += Math.abs(i - j);
                })
                return Object.assign(pa, { Distance: total })
            }).sort((a, b) => {
                if (a.Distance > b.Distance) {
                    return 1;
                } else if (a.Distance < b.Distance) {
                    return -1;
                }
                return 0;
            })
            console.log("HELLO", OneAResponse.Answer, question.PossibleAnswers);

            if ((response.Answer as ValueObj).label == question.PossibleAnswers[0].label) {
                req.body.Score = 4;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[1].label) {
                req.body.Score = question.PossibleAnswers[1].Distance == question.PossibleAnswers[0].Distance1 ? 4 : 1;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[2].label) {
                req.body.Score = question.PossibleAnswers[2].Distance == question.PossibleAnswers[1].Distance1 ? 1 : 0;
            }

            next();
        }
        catch (err) {
            console.log(err);
            res.json("no sir")
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

                let gameForUpdate = Object.assign(game, { CurrentRound: Object.assign(game.CurrentRound, {CurrentHighestBid}) })

                const updatedGame = await monGameModel.findByIdAndUpdate(team.GameId, gameForUpdate);
            }

            next();
            
        } catch (err) {
            console.log(err);
            res.status(500)
            res.send("couldnt do bid")
        }
    }

    public async getTeamsFor4BRating(req: Request, res: Response){
        

        try{

            const GameId = req.params.gameid;
            //const RoundId = req.params.roudid;

            //do this a better way.
            const RoundId = await monSubRoundModel.findOne({Name: "PRICING"}).then(r => r ? r._id : null)
            if(!RoundId)  throw new Error("No subuound found");

            const responses: ResponseModel[] = await monResponseModel.find( { GameId, RoundId } ).then(r => r ? r.map(r => Object.assign(new ResponseModel(), r.toJSON())) : []);

            if (!responses || !responses.length) throw new Error("No responses found")

            res.json(responses);

        }
        catch(err){
            console.log(err);
            res.status(500);
            res.send("couldn't get resposnes")
        }

    }

    public routes() {
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/get4bresponses/:gameid", this.getTeamsFor4BRating.bind(this));
        this.router.post("/response", this.SaveResponse.bind(this));
        this.router.post("/1bresponse", this.Save1BResponse.bind(this), this.SaveResponse.bind(this));
        this.router.post("/roundresponses", this.GetTeamResponsesByRound.bind(this));
        this.router.post("/bid", this.SubmitBid.bind(this), this.SaveResponse.bind(this));
        this.router.post("/3response", this.SaveRound3Response.bind(this));

    }
}

export default new GamePlayRouter().router;