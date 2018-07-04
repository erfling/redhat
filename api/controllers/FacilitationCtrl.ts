import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import TeamModel from '../../shared/models/TeamModel';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import { monTeamModel } from './TeamCtrl'
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom'
import { AppServer } from '../AppServer'

class FacilitationCtrl
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
        
    }

    public async ChangeRound(req: Request, res: Response):Promise<any> {
        const id = req.params.id;
        
        AppServer.LongPoll.publish(SapienServerCom.BASE_REST_URL + "/gameplay/listenforgameadvance/" + id,"hello")
        res.json("yo")
    }

    public async SaveResponse(req: Request, res: Response){
        const response: ResponseModel = Object.assign(new ResponseModel(), req.body as ResponseModel);

       
    }

    public async GetTeamResponsesByRound(req: Request, res: Response){
        
    }

    public routes(){
        this.router.post("/round/:gameid", this.ChangeRound.bind(this));

    }
}

export default new FacilitationCtrl().router;