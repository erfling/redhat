import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import SchemaBuilder from '../SchemaBuilder';
import GameModel from '../../shared/models/GameModel';
import { monTeamModel } from './TeamCtrl';
import TeamModel from '../../shared/models/TeamModel';
import MathUtil from '../../shared/entity-of-the-state/MathUtil'
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import SubRoundScore from '../../shared/models/SubRoundScore';
import { JobName } from '../../shared/models/UserModel';
import { sortBy } from 'lodash'; 

const mappingSchObj = SchemaBuilder.fetchSchema(RoundChangeMapping);
const monMappingSchema = new mongoose.Schema(mappingSchObj);
export const monMappingModel = mongoose.model("roundchangemapping", monMappingSchema);



const schObj = SchemaBuilder.fetchSchema(GameModel);
//schObj.Facilitator = { type: mongoose.Schema.Types.ObjectId, ref: "user" }
schObj.Teams = [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }];
schObj.GamePIN = { type: Number, unique: true }
const monSchema = new mongoose.Schema(schObj);


export const monGameModel = mongoose.model("game", monSchema);

class GameCtrl {
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
            let games = await monGameModel.find()//.populate("Facilitator");
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
                //.populate("Facilitator")
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
        //if (game.Facilitator && game.Facilitator._id) game.Facilitator = game.Facilitator._id.toString();
        try {
            console.log("HERE!!",game);
            if (!game._id) {
                if (!game.GamePIN) game.GamePIN = MathUtil.randomXDigits(4);

                const mapping = new RoundChangeMapping();
                mapping.ChildRound = "priorities";
                mapping.ParentRound = "peopleround";
                
                game.CurrentRound = mapping;
                const newGame = await monGameModel.create(game).then(r => r);
                if (newGame) {
                    const savedGame = await monGameModel
                        .findById(newGame._id)
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
                    const savedGame = await monGameModel.findById(newGame._id)//.populate("Facilitator")
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
        if (!team.GameId) return res.json("NO GAME ID PROVIDED")
        try {

            team.Players = team.Players.map(p => p._id)

            if (team._id) {
                console.log("SAVING TEAM: ",team._id);
                var savedTeam = await monTeamModel.findByIdAndUpdate(team._id, team).then(t => Object.assign(new TeamModel(), t.toJSON()))
            } else {
                var savedTeam = await monTeamModel.create(team).then(t => Object.assign(new TeamModel(), t.toJSON()))
            }

            if (!savedTeam) return res.json("team wasn't saved");

            var existingGame = await monGameModel.findById(team.GameId).populate("Teams").then(g => Object.assign(new GameModel(), g.toObject()))

            if (existingGame) {
                if (!existingGame.Teams) existingGame.Teams = [];
                let mapping = existingGame.CurrentRound && existingGame.CurrentRound.UserJobs ? existingGame.CurrentRound : {
                    UserJobs:{},
                    GameId: existingGame._id,
                    ParentRound: 'peopleround',
                    ChildRound: 'priorities',
                    SlideNumber: 1
                };
            
                if (!mapping) throw new Error("no mapping")

                if(!mapping.UserJobs || mapping.ChildRound == "priorities"){
                    existingGame.Teams.forEach(t => {
                        let pid = t.Players[0]._id;
                        console.log("HELLO",pid, mapping.UserJobs, existingGame)
                        mapping.UserJobs[pid] = JobName.MANAGER;                   
                    })
                }

                existingGame.CurrentRound = mapping as RoundChangeMapping;

                if (!team._id) existingGame.Teams = existingGame.Teams.concat(savedTeam)

                existingGame.Teams = sortBy(existingGame.Teams, "Number").map(t => t._id);

                var savedGame = await monGameModel
                    .findByIdAndUpdate(existingGame._id, existingGame, {new: true})
                    .populate({
                        path: "Teams",
                        populate: {
                            path: "Players"
                        },
                    }).then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null);
                
                if (!existingGame) throw new Error("no saved game")

                console.log(existingGame)
                res.json(savedGame);
            } else {
                throw new Error("no game")
            }

        } catch(err) {
            console.log(err)
            res.status(500).send("no save")
        }

    }

    public async DeleteTeam(req, res){
        const team: TeamModel = Object.assign(new TeamModel(), req.body)
        
        try{
            //remove the team from the game
            const game = await monGameModel.findById(team.GameId).then(r => Object.assign(new GameModel(), r.toJSON()))
            console.log(game)
            if(game){
                const Teams = game.Teams.filter(t => t != team._id);
                const savedGame = await monGameModel
                                        .findByIdAndUpdate(game._id, {Teams}, {new: true})
                                        .populate("Facilicator")
                                        .populate({
                                            path: "Teams",
                                            populate: {
                                                path: "Players"
                                            }
                                        });

                if(savedGame){
                    //delete the team
                    const updatedTeam = await monTeamModel.findByIdAndRemove(team._id)
                }
    
                res.json(savedGame)
            }
            

        }
        catch(err){
            console.log(err)
            res.json("The team couldn't be removed")
        }
        

    }

    public routes() {
        this.router.get("/", this.GetGames.bind(this));
        this.router.get("/:game", this.GetGame.bind(this));
        this.router.post("/", this.SaveGame.bind(this));
        this.router.post("/team", this.saveTeam.bind(this))
        this.router.post("/team/delete", this.DeleteTeam.bind(this))
    }
}

export default new GameCtrl().router;