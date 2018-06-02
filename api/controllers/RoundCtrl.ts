import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import { DBRound, DBRoundModel } from '../models/DBRound';
import SchemaBuilder from '../SchemaBuilder';
import RoundModel from '../../shared/models/RoundModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';

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

        //console.log(SchemaBuilder.buildSchema(RoundModel));
        //console.log("SCHEMA:", getAllProps(RoundModel));
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
        console.log("GET GAMES CALLED");
        
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
        const ID = req.params.game;
        console.log(ID);
        try {
            let round = await DBRoundModel.findById(ID);
            if (!round) {
              res.status(400).json({ error: 'No games' });
            } else {
              res.json(round);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
    }

    public async CreateRound(req: Request, res: Response):Promise<any> {
        console.log(req.body);
        const round = new DBRoundModel(req.body);         
        const r = new DBRoundModel(round);
        
        const savedRound = await r.save();
        res.json(savedRound);
    }


    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/:round", this.GetRound.bind(this));
        this.router.post("/", this.CreateRound.bind(this));
    }
}

export default new RoundRouter().router;