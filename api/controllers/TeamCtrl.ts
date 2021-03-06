import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../SchemaBuilder';
import TeamModel from '../../shared/models/TeamModel';

const schObj = SchemaBuilder.fetchSchema(TeamModel);
schObj.Players = [{type: mongoose.Schema.Types.ObjectId, ref: "user"}];

const monSchema = new mongoose.Schema(schObj);
export const monTeamModel = mongoose.model("team", monSchema);


class TeamRouter
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
        
        console.log("Team Ctrl ctor++");
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

    public async SaveRound(req: Request, res: Response):Promise<any> {
        const roundToSave = req.body as RoundModel;
   
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
            if(!roundToSave.Name || !roundToSave.Name.length || !roundToSave._id) {
                var savedRound = await monTeamModel.create(roundToSave);
            } else {
                var savedRound = await monTeamModel.findOneAndUpdate({Name: roundToSave.Name}, roundToSave, {new: true})
                
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

export default new TeamRouter().router;