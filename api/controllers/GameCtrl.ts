import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import RoundModel from '../../shared/models/RoundModel';
import GameModel from '../../shared/models/GameModel';
import { monTeamModel } from './TeamCtrl';
import TeamModel from '../../shared/models/TeamModel';
import MathUtil from '../../shared/entity-of-the-state/MathUtil'

const schObj = SchemaBuilder.fetchSchema(GameModel);
schObj.Facilitator = { type: mongoose.Schema.Types.ObjectId, ref: "user" }
schObj.Teams = [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }];
schObj.GamePIN = { type: Number, unique: true }
const monSchema = new mongoose.Schema(schObj);


export const monGameModel = mongoose.model("game", monSchema);

class GameRouter {
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
        this.router = Router({ mergeParams: true });
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

    public async GetGames(req: Request, res: Response): Promise<GameModel[] | any> {
        console.log("GET GAMES CALLED");

        try {
            let games = await monGameModel.find().populate("Facilitator");
            if (!games) {
                return res.status(400).json({ error: 'No games' });
            } else {
                console.log()
                const status = res.status;
                return res.json(games);
            }
        } catch (err) {
            console.log("ERROR", err);
            (err: any) => res.status(500).json({ error: err });
        }

    }

    public async GetGame(req: Request, res: Response): Promise<GameModel | any> {
        const ID = req.params.game;
        console.log(ID, "YES?");
        try {
            //WHY CAN"T WE CALL POPULATE ON TEAMS?
            let game = await monGameModel.findById(ID)
                .populate("Facilitator")
                .populate({
                    path: "Teams",
                    populate: {
                        path: "Players"
                    }
                });


            if (!game) {
                res.status(400).json({ error: 'No games' });
            } else {
                const status = res.status;
                res.json(game);
            }
        } catch (err) {
            (err: any) => res.status(500).json({ error: err });
        }
    }

    public async SaveGame(req: Request, res: Response): Promise<any> {
        const game: GameModel = req.body;
        if (game.Facilitator && game.Facilitator._id) game.Facilitator = game.Facilitator._id.toString();
        try {
            console.log(game);
            if (!game._id) {
                if (!game.GamePIN) game.GamePIN = MathUtil.randomXDigits(4);
                const newGame = await monGameModel.create(game).then(r => r);
                if (newGame) {
                    const savedGame = await monGameModel
                        .findById(newGame._id)
                        .populate("Facilitator")
                        .populate({
                            path: "Teams",
                            populate: {
                                path: "Players"
                            }
                        });
                    res.json(savedGame);
                } else {
                    //res.json("Game not saved"); // TODO: Consider throwing an error, but make sure error.code == 11000 can still be caught.
                }
            } else {
                const newGame = await monGameModel.findByIdAndUpdate(game._id, game, { new: true }).then(r => r);
                if (newGame) {
                    const savedGame = await monGameModel.findById(newGame._id).populate("Facilitator")
                    res.json(savedGame);
                } else {
                    //res.json("Game not saved"); // TODO: Consider throwing an error, but make sure error.code == 11000 can still be caught.
                }
            }
        } catch (error) {
            console.log(error);
            if (error.code == 11000) {
                game.GamePIN = MathUtil.randomXDigits(4);
                await this.SaveGame(req, res);
            } else {
                res.json("Game not saved");
            }
        }


    }

    public async saveTeam(req: Request, res: Response) {
        const team = req.body as TeamModel;
        console.warn(team)
        if (!team.GameId) return res.json("NO GAME ID PROVIDED")
        try {

            team.Players = team.Players.map(p => p._id)

            if (team._id) {
                var savedTeam = await monTeamModel.findByIdAndUpdate(team._id, team).then(t => t)
            } else {
                var savedTeam = await monTeamModel.create(team).then(t => t)
            }

            if (!savedTeam) return res.json("team wasn't saved");

            var existingGame = await monGameModel.findById(team.GameId).then(g => g.toObject() as GameModel)

            if (existingGame) {
                if (!existingGame.Teams) existingGame.Teams = [];
                existingGame.Teams = existingGame.Teams.filter(t => t._id != savedTeam._id.toString()).concat(savedTeam._id);
                var savedGame = await monGameModel
                    .findByIdAndUpdate(existingGame._id.toString(), existingGame)
                    .populate("Facilicator")
                    .populate({
                        path: "Teams",
                        populate: {
                            path: "Players"
                        }
                    });
                res.json(savedGame);
            } else {
                res.send("save failed")
            }

        } catch {
            res.send("no save")
        }

    }


    public routes() {
        this.router.get("/", this.GetGames.bind(this));
        this.router.get("/:game", this.GetGame.bind(this));
        this.router.post("/", this.SaveGame.bind(this));
        this.router.post("/team", this.saveTeam.bind(this))
    }
}

export default new GameRouter().router;