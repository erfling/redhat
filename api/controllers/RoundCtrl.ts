import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import { DBRound, DBRoundModel } from '../models/DBRound';
import RoundModel from '../../shared/models/RoundModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';

const schObj = SchemaBuilder.fetchSchema(RoundModel);
const monSchema = new mongoose.Schema(schObj);
export const monRoundModel = mongoose.model("round", monSchema);

class RoundRouter
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
        
        
        console.log("monSchema:", monRoundModel);
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
    
    public async GetRounds(req: Request, res: Response):Promise<DBRound[] | any> {
        console.log("CALLING GET ROUNDS");
        
        try {
            let rounds = await DBRoundModel.find();
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
            let round = await DBRoundModel.findOne({Name: ID});
            if (!round) {
              res.status(400).json({ error: 'No round' });
            } else {
              res.json(round);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async SaveRound(req: Request, res: Response):Promise<any> {
        const roundToSave = req.body as RoundModel;
        console.log(roundToSave, roundToSave.Name, roundToSave.Name.length);

        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
            if(!roundToSave.Name || !roundToSave.Name.length || !roundToSave._id) {
                console.log("HERE")
                var savedRound = await monRoundModel.create(roundToSave);
            } else {
                var savedRound = await monRoundModel.findOneAndUpdate({Name: roundToSave.Name}, roundToSave, {new: true})
                console.log(savedRound);
            }
            res.json(savedRound);
        }
        catch{

        }
    }


    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/:round", this.GetRound.bind(this));
        this.router.post("/", this.SaveRound.bind(this));
    }
}

export default new RoundRouter().router;