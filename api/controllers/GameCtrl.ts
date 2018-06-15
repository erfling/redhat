import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import RoundModel from '../../shared/models/RoundModel';
import GameModel from '../../shared/models/GameModel';


const schObj = SchemaBuilder.fetchSchema(GameModel);
schObj.Teams = [mongoose.Schema.Types.ObjectId];
const monSchema = new mongoose.Schema(schObj);


export const monGameModel = mongoose.model("game", monSchema);

class GameRouter
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
    
    public async GetGames(req: Request, res: Response):Promise<GameModel[] | any> {
        console.log("GET GAMES CALLED");
        
        try {
            let games = await monGameModel.find().populate({path: "Teams"});
            if (!games) {
                return res.status(400).json({ error: 'No games' });
            } else {
                const status = res.status;
                return res.json( games );
            }
        } catch(err) {
            console.log("ERROR", err);
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async GetGame(req: Request, res: Response):Promise<GameModel | any> {
        const ID = req.params.game;
        console.log(ID);
        try {
            let game = await monGameModel.findById(ID)
            if (!game) {
              res.status(400).json({ error: 'No games' });
            } else {
              res.json(game);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
    }

    public async CreateGame(req: Request, res: Response):Promise<any> {
        const game = new monGameModel(req.body);         
        const g = new monGameModel(game);
        
        const savedGame = await g.save();

        const newGame = await monGameModel.findOneAndUpdate({_id: g._id},{State: "1A"},{new:true});

        res.json(newGame);
    }


    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetGames.bind(this));
        this.router.get("/:game", this.GetGame.bind(this));

    }
}

export default new GameRouter().router;