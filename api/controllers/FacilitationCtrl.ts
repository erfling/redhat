import { Router, Request, Response, NextFunction } from 'express';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import { AppServer } from '../AppServer';
import RoundChangeLookup from '../../shared/models/RoundChangeLookup';
import SchemaBuilder from '../SchemaBuilder';
import * as mongoose from 'mongoose';

const schObj = SchemaBuilder.fetchSchema(RoundChangeLookup);
schObj.Round = { type: mongoose.Schema.Types.ObjectId, ref: "round" };
schObj.SubRound = { type: mongoose.Schema.Types.ObjectId, ref: "subround" };
const monRoundChangeLookupSchema = new mongoose.Schema(schObj);
export const monRoundChangeLookupModel = mongoose.model("message", monRoundChangeLookupSchema);

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

    public async getRoundChangeLookups(req: Request,  res: Response){
        try{
            const lookups = await monRoundChangeLookupModel.find().then(lookups => lookups ? lookups.map(l => Object.assign(new RoundChangeLookup(), l)) : null);

            if(!lookups) throw new Error();

            res.json(lookups);

        }catch(err){
            res
                .status(500)
                .send("Can't get it")
        }
    }

    public async GetTeamResponsesByRound(req: Request, res: Response){
        
    }

    public routes(){
        this.router.post("/round/:gameid", this.ChangeRound.bind(this));
        this.router.get("/getroundchangelookups", this.getRoundChangeLookups.bind(this))

    }
}

export default new FacilitationCtrl().router;