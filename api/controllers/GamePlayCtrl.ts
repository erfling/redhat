import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import TeamModel from '../../shared/models/TeamModel';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import { monTeamModel } from './TeamCtrl'

const schObj = SchemaBuilder.fetchSchema(ResponseModel);
schObj.Answer = { label: String, data: String, isSaved: Boolean}
schObj.Answers = [{ label: String, data: String, isSaved: Boolean}]
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
        console.log(response, req.body);
        try{
            if(!response._id) {
                var SavedResponse = await monResponseModel.create(response).then(r => r.toObject() as ResponseModel);
            } else {
                var SavedResponse = await monResponseModel.findByIdAndUpdate(response._id, response, {new: true}).then(r => r.toObject() as ResponseModel);
            }

            res.json(SavedResponse);
        }
        catch(error){
            res.json(error)
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
        this.router.post("/roundresponses", this.GetTeamResponsesByRound.bind(this));
    }
}

export default new GamePlayRouter().router;