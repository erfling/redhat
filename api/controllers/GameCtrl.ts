import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import RoundModel from '../../shared/models/RoundModel';
import GameModel from '../../shared/models/GameModel';
import { monTeamModel } from './TeamCtrl';

const schObj = SchemaBuilder.fetchSchema(GameModel);
schObj.Teams = {type: [mongoose.Schema.Types.ObjectId], ref: "team"};
schObj.Facilitator = {type: mongoose.Schema.Types.ObjectId, ref: "user"}
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
            let games = await monGameModel.find().populate("Facilitator");
            if (!games) {
                return res.status(400).json({ error: 'No games' });
            } else {
                console.log()
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
            //WHY CAN"T WE CALL POPULATE ON TEAMS?
            let game = await monGameModel.findById(ID).populate("Teams").populate("Facilitator")
            if (!game) {
              res.status(400).json({ error: 'No games' });
            } else {
              res.json(game);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
    }

    public async SaveGame(req: Request, res: Response):Promise<any> {

        const game:GameModel = req.body;
        if(game.Facilitator)game.Facilitator = game.Facilitator._id.toString();

        try{
            console.log(game);
            if(!game._id){
                const newGame = await monGameModel.create(game).then(r => r);
                if(newGame){
                    const savedGame = await monGameModel.findById(newGame._id).populate("Facilitator")
                    res.json(savedGame);                
                } else {
                    res.json("Game not saved")
                }
            } else {
                const newGame = await monGameModel.findByIdAndUpdate(game._id, game,{new: true}).then(r => r);
                if(newGame){
                    const savedGame = await monGameModel.findById(newGame._id).populate("Facilitator")
                    res.json(savedGame);
                } else {
                    res.json("Game not saved")
                }
            }
            
        } 
        catch (error) {
            console.log(error);
            res.json("Game not saved");
        }    
        
    }


    public routes(){
        this.router.get("/", this.GetGames.bind(this));
        this.router.get("/:game", this.GetGame.bind(this));
        this.router.post("/", this.SaveGame.bind(this));
    }
}

export default new GameRouter().router;