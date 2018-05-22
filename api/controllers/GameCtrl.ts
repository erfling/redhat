import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import { DBGameModel, DBGame } from '../models/DBGame';

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
    
    public async GetGames(req: Request, res: Response):Promise<DBGame[] | any> {
        console.log("GET GAMES CALLED");
        
        try {
            let games = await DBGameModel.find().populate({path: "Teams"});
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

    public async GetGame(req: Request, res: Response):Promise<any> {
        const ID = req.params.game;
        console.log(ID);
        try {
            let game = await DBGameModel.findById(ID).populate({path: "Teams", populate: {path: "Nation"}});
        
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
        const game = new DBGameModel(req.body);         
        const g = new DBGameModel(game);
        
        const savedGame = await g.save();

        const newGame = await DBGameModel.findOneAndUpdate({_id: g._id},{State: "1A"},{new:true});

        res.json(newGame);
    }


    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetGames.bind(this));
        this.router.get("/:game", this.GetGame.bind(this));

    }
}

export default new GameRouter().router;