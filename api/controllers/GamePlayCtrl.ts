import { AppServer } from '../AppServer'

import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import TeamModel from '../../shared/models/TeamModel';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import { monTeamModel } from './TeamCtrl'
import { LongPollCtrl, LongPollRouter} from './LongPollCtrl'
import ValueObj from '../../shared/entity-of-the-state/ValueObj';
import { monQModel } from './RoundCtrl';
import QuestionModel from '../../shared/models/QuestionModel';
import PossibleAnswerModel from '../../shared/models/PossibleAnswerModel';

const schObj = SchemaBuilder.fetchSchema(ResponseModel);
const monSchema = new mongoose.Schema(schObj);
export const monResponseModel = mongoose.model("response", monSchema);

class GamePlayRouter
{
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
        this.router = Router({mergeParams:true});

        //TODO: figure out why AppServer import is undefined unless we wait a tick????????????
        setTimeout(() => {
            this.routes();
        },1)
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
    
    public async GetRounds(req: Request, res: Response):Promise<any> {
        console.log("CALLING GET ROUNDS");
        
        try {
            let rounds = await monTeamModel.find().populate("Players");
            if (!rounds) {
                return res.status(400).json({ error: 'No games' });
            } else {
                const status = res.status;
                return res.json( rounds );
            }
        } catch(err) {
            console.log("ERROR", err);
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async GetRound(req: Request, res: Response):Promise<any> {
        
        const ID = req.params.round;
        console.log("TRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let round = await monTeamModel.findOne({Name: ID});
            if (!round) {
              res.status(400).json({ error: 'No round' });
            } else {
              res.json(round);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async SaveResponse(req: Request, res: Response){
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try{
            if(!response._id) {
                console.log("HERE")
                var SaveResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
            } else {
                var SaveResponse = await monResponseModel.findByIdAndUpdate(response._id, response, {new: true}).then(r => r.toObject() as ResponseModel);
            }
            console.log(SaveResponse);

            res.json(SaveResponse);
        }
        catch{

        }
    }

    //Special case, since 1b responses depend on 1A responses
    public async Save1BResponse(req: Request, res: Response, next){
        console.log("WE DONE CALLED THIS")
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

        try{
           
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
                    total += Math.abs(i-j);
                })
                return Object.assign(pa, {Distance: total})
            }).sort((a, b) => {
                if(a.Distance > b.Distance){
                    return 1;
                } else if (a.Distance < b.Distance) {
                    return -1;
                }
                return 0;
            })
            console.log("HELLO",OneAResponse.Answer, question.PossibleAnswers);
            
            if((response.Answer as ValueObj).label == question.PossibleAnswers[0].label){
                req.body.Score = 4;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[1].label){
                req.body.Score = question.PossibleAnswers[1].Distance ==  question.PossibleAnswers[0].Distance1 ? 4 : 1;
            } else if ((response.Answer as ValueObj).label == question.PossibleAnswers[2].label){
                req.body.Score = question.PossibleAnswers[2].Distance ==  question.PossibleAnswers[1].Distance1 ? 1 : 0;
            }

            next();
        }
        catch (err){
            console.log(err);
            res.json("no sir")
        }
    }

    public async GetTeamResponsesByRound(req: Request, res: Response){
        const fetcher = req.body as ResponseFetcher;
        try{
            const responses = await monResponseModel.find( { TeamId: fetcher.TeamId, GameId: fetcher.GameId, RoundId: fetcher.RoundId} ).then(r => r.map(resp => resp.toObject() as ResponseModel))
            res.json(responses)
        } catch (err) {
            res.json(err)
        }
    }

    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.post("/response", this.SaveResponse.bind(this));
        this.router.post("/1bresponse", this.Save1BResponse.bind(this), this.SaveResponse.bind(this));
        this.router.post("/roundresponses", this.GetTeamResponsesByRound.bind(this));
        
    }
}

export default new GamePlayRouter().router;