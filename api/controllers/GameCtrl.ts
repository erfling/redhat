import { monRoundModel } from "./RoundCtrl";
import { Router, Request, Response, NextFunction } from "express";
import * as mongoose from "mongoose";
import SchemaBuilder from "../SchemaBuilder";
import GameModel from "../../shared/models/GameModel";
import { monTeamModel } from "./TeamCtrl";
import TeamModel from "../../shared/models/TeamModel";
import MathUtil from "../../shared/entity-of-the-state/MathUtil";
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import SubRoundScore from "../../shared/models/SubRoundScore";
import UserModel, { JobName } from "../../shared/models/UserModel";
import { sortBy } from "lodash";
import * as Passport from "passport";
import AuthUtils, { PERMISSION_LEVELS } from "../AuthUtils";
import FacilitationRoundResponseMapping from "../../shared/models/FacilitationRoundResponseMapping";
import RoundModel from "../../shared/models/RoundModel";

const mappingSchObj = SchemaBuilder.fetchSchema(RoundChangeMapping);
const monMappingSchema = new mongoose.Schema(mappingSchObj);
export const monMappingModel = mongoose.model(
  "roundchangemapping",
  monMappingSchema
);

const schObj = SchemaBuilder.fetchSchema(GameModel);
//schObj.Facilitator = { type: mongoose.Schema.Types.ObjectId, ref: "user" }
schObj.Teams = [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }];
schObj.GamePIN = { type: Number, unique: true };
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

  public async GetGames(
    req: Request,
    res: Response
  ): Promise<GameModel[] | any> {
    console.log("GET GAMES CALLED");

    try {
      let games = await monGameModel.find(); //.populate("Facilitator");
      if (!games) {
        return res.status(400).json({ error: "No games" });
      } else {
        console.log();
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
    try {
      //WHY CAN"T WE CALL POPULATE ON TEAMS?
      let game = await monGameModel
        .findById(ID)
        //.populate("Facilitator")
        .populate({
          path: "Teams",
          populate: {
            path: "Players",
          },
        });

      if (!game) {
        res.status(400).json({ error: "No games" });
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
      if (!game._id) {
        let rounds: RoundModel[] = await monRoundModel
          .find({ IsActive: true })
          .populate("SubRounds")
          .sort({ Weight: 1 })
          .then((roundDocs) => {
            return roundDocs.map(
              (roundDoc) =>
                ({ ...new RoundModel(), ...roundDoc.toJSON() } as RoundModel)
            );
          });
        const firstRound = rounds[1];
        console.log("FIRST ROUND", firstRound);

        const firstSR = firstRound.SubRounds[0];

        if (!game.GamePIN) game.GamePIN = MathUtil.randomXDigits(4);

        const newGame = await monGameModel.create(game).then((r) => r.toJSON());
        if (!newGame) throw new Error("Game not created");

        const mapping = new RoundChangeMapping();
        mapping.ChildRound = firstSR.Name.toLowerCase();
        mapping.ParentRound = firstRound.Name.toLowerCase();
        mapping.RoundId = firstRound._id;
        mapping.SubRoundId = firstSR._id;
        mapping.UserJobs = {};
        mapping.GameId = newGame._id;
        let savedMapping: RoundChangeMapping = await monMappingModel
          .create(mapping)
          .then((m) =>
            m ? Object.assign(new RoundChangeMapping(), m.toJSON()) : null
          );
        if (!savedMapping) throw new Error("no mapping");

        const savedGame = await monGameModel
          .findByIdAndUpdate(newGame._id, { CurrentRound: savedMapping })
          .populate({
            path: "Teams",
            populate: {
              path: "Players",
            },
          });

        res.json(savedGame);
      } else {
        const newGame = await monGameModel
          .findByIdAndUpdate(game._id, game, { new: true })
          .then((r) => r);
        if (newGame) {
          const savedGame = await monGameModel
            .findById(newGame._id) //.populate("Facilitator")
            .populate({
              path: "Teams",
              populate: {
                path: "Players",
              },
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
        res.status(500).json("Game not saved");
      }
    }
  }

  public async saveTeam(req: Request, res: Response) {
    const team = req.body as TeamModel;
    if (!team.GameId) return res.json("NO GAME ID PROVIDED");
    let newTeam = false;
    try {
      team.Players = team.Players.filter((p) => p != null && p._id).map(
        (p) => p._id
      );

      if (team._id) {
        console.log("SAVING TEAM: ", team._id);
        var savedTeam = await monTeamModel
          .findByIdAndUpdate(team._id, team)
          .then((t) => Object.assign(new TeamModel(), t.toJSON()));
      } else {
        var savedTeam = await monTeamModel
          .create(team)
          .then((t) => Object.assign(new TeamModel(), t.toJSON()));
      }

      if (!savedTeam) return res.json("team wasn't saved");

      var existingGame = await monGameModel
        .findById(team.GameId)
        .populate("Teams")
        .then((g) => Object.assign(new GameModel(), g.toObject()));
      if (!team._id) existingGame.Teams = existingGame.Teams.concat(savedTeam);

      if (existingGame) {
        if (!existingGame.Teams) existingGame.Teams = [savedTeam];

        let mapping: RoundChangeMapping = existingGame.CurrentRound
          ? existingGame.CurrentRound
          : {
              UserJobs: {},
              GameId: existingGame._id,
              ParentRound: "peopleround",
              ChildRound: "priorities",
              SlideNumber: 1,
            };

        if (!mapping) throw new Error("no mapping");

        let savedMapping = mapping;
        if (!mapping._id)
          savedMapping = await monMappingModel
            .create(mapping)
            .then((m) =>
              m ? Object.assign(new RoundChangeMapping(), m.toJSON()) : null
            );
        if (!savedMapping) throw new Error("mapping not saved");

        if (
          !savedMapping.UserJobs ||
          savedMapping.ChildRound.toLowerCase() == "priorities"
        ) {
          savedMapping.UserJobs = {};
          console.log(
            "Dew it here",
            !savedMapping.UserJobs,
            savedMapping.ChildRound.toLowerCase() == "priorities"
          );

          existingGame.Teams.forEach((t) => {
            let pid = t.Players[0]._id;
            console.log("HELLO", pid, savedMapping.UserJobs);
            savedMapping.UserJobs[pid] = JobName.MANAGER;
          });
        }

        //new teams always get player 1 assigned as manager
        else if (!team._id) {
          console.log("THIS IS A NEW TEAm");
          let pid = savedTeam.Players[0]._id;
          savedMapping.UserJobs[pid] = JobName.MANAGER;
        }
        console.log("MAPPING", savedMapping);

        existingGame.CurrentRound = savedMapping as RoundChangeMapping;

        existingGame.Teams = sortBy(existingGame.Teams, "Number").map(
          (t) => t._id
        );

        var savedGame = await monGameModel
          .findByIdAndUpdate(existingGame._id, existingGame, { new: true })
          .populate({
            path: "Teams",
            populate: {
              path: "Players",
            },
          })
          .then((g) => (g ? Object.assign(new GameModel(), g.toJSON()) : null));

        if (!existingGame) throw new Error("no saved game");

        //update the mapping in the mappings collection so it can be swapped out when necessary
        savedMapping = await monMappingModel
          .findByIdAndUpdate(savedMapping._id, savedGame.CurrentRound)
          .then((m) =>
            m ? Object.assign(new RoundChangeMapping(), m.toJSON()) : null
          );
        if (!savedMapping) throw new Error("mapping not updated");

        res.json(savedGame);
      } else {
        throw new Error("no game");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("no save");
    }
  }

  public async DeleteTeam(req, res) {
    const team: TeamModel = Object.assign(new TeamModel(), req.body);

    try {
      //remove the team from the game
      const game = await monGameModel
        .findById(team.GameId)
        .then((r) => Object.assign(new GameModel(), r.toJSON()));
      console.log(game);
      if (game) {
        const Teams = game.Teams.filter((t) => t != team._id);
        const savedGame = await monGameModel
          .findByIdAndUpdate(game._id, { Teams }, { new: true })
          .populate("Facilicator")
          .populate({
            path: "Teams",
            populate: {
              path: "Players",
            },
          });

        if (savedGame) {
          //delete the team
          const updatedTeam = await monTeamModel.findByIdAndRemove(team._id);
        }

        res.json(savedGame);
      }
    } catch (err) {
      console.log(err);
      res.json("The team couldn't be removed");
    }
  }

  public async GetContentEditTeam(req: Request, res: Response) {
    try {
      let user = req["user"] as UserModel;
      let editableGame = await monGameModel
        .findOne({ IsContentEditable: true })
        .then((g) => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      console.log(editableGame);
      if (!editableGame) {
        editableGame = await monGameModel
          .create({ IsContentEditable: true })
          .then((g) => (g ? Object.assign(new GameModel(), g.toJSON()) : null));
      }

      if (!editableGame) throw new Error();

      let dummyTeam: TeamModel = new TeamModel();
      dummyTeam.Players = [user];
      dummyTeam.GameId = editableGame._id;
      res.json(dummyTeam);
    } catch (e) {
      console.log(e);
      res.status(500).send("couldn't find or create game");
    }
  }

  public async DeleteGame(req: Request, res: Response): Promise<any> {
    const id = req.params.gameID;
    console.log("trying to delete user with ID: ", id);
    try {
      const savedUser = monGameModel.findByIdAndRemove(id).then((r) => r);
      res.json("game successfully removed");
    } catch {
      res.json("game not removed");
    }
  }

  public async SetTeamRoles(req: Request, res: Response) {
    try {
      //we'll submit a whole team.
      let team = req.body as FacilitationRoundResponseMapping;

      //get the team's game for mutation.
      let game: GameModel = await monGameModel
        .findById(team.GameId)
        .then((game) =>
          game ? Object.assign(new GameModel(), game.toJSON()) : null
        );

      if (!game) throw new Error("No game found");

      let CurrentRound = game.CurrentRound;

      team.Members.forEach((p) => {
        CurrentRound.UserJobs[p._id] = p.Job;
      });

      //find the relevant RoundChangeCapping so jobs are preserved if rounds change
      let rcm: RoundChangeMapping = await monMappingModel
        .findOneAndUpdate(
          {
            GameId: game._id.toString(),
            ParentRound: CurrentRound.ParentRound,
            ChildRound: CurrentRound.ChildRound,
          },
          { UserJobs: CurrentRound.UserJobs },
          { upsert: true }
        )
        .then((rcm) =>
          rcm ? Object.assign(new RoundChangeMapping(), rcm.toJSON()) : null
        );

      //save the game
      game = await monGameModel
        .findByIdAndUpdate(game._id, { CurrentRound })
        .then((game) =>
          game ? Object.assign(new GameModel(), game.toJSON()) : null
        );

      if (!game) throw new Error("Game could not be saved");

      res.json(game);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }

  public routes() {
    this.router.get("/", this.GetGames.bind(this));
    this.router.get("/:game", this.GetGame.bind(this));
    this.router.get(
      "/edit/game",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
      this.GetContentEditTeam.bind(this)
    );
    this.router.delete(
      "/:gameID",
      Passport.authenticate("jwt", { session: false }),
      (req, res, next) =>
        AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
      this.DeleteGame.bind(this)
    );
    this.router.post("/", this.SaveGame.bind(this));
    this.router.post("/team", this.saveTeam.bind(this));
    this.router.post("/team/delete", this.DeleteTeam.bind(this));
    this.router.post("/team/roles", this.SetTeamRoles.bind(this));
  }
}

export default new GameCtrl().router;
