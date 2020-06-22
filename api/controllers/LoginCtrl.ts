import { JobName } from "./../../shared/models/UserModel";
import { Router, Request, Response, NextFunction } from "express";
import UserModel, { RoleName } from "../../shared/models/UserModel";
import * as Passport from "passport";
import * as jwt from "jsonwebtoken";
import { monGameModel, monMappingModel } from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import { monUserModel } from "./UserCtrl";
import TeamModel from "../../shared/models/TeamModel";
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import { monRoundModel } from "./RoundCtrl";

//this class is exported for use in other routers
export class LoginCtrlClass {
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

  public async Login(req: Request, res: Response): Promise<any> {
    const loginInfo = req.body as { Email: string; GamePIN: number };
    console.log("USER", req.body);
    //const dbRoundModel = new monRoundModel(roundToSave);

    //get the game
    try {
      const game: GameModel = await monGameModel
        .findOne({ GamePIN: loginInfo.GamePIN })
        .populate({
          path: "Teams",
        })
        .populate("Facilitator")
        .then((r) =>
          Object.assign(new GameModel(), JSON.parse(JSON.stringify(r.toJSON())))
        );

      if (!game) {
        throw "We couldn't find the game you're trying to join. Please try again.";
      }

      //const updatedGame
      const user: UserModel = await monUserModel
        .findOne({ Email: loginInfo.Email })
        .then((r) =>
          Object.assign(new UserModel(), JSON.parse(JSON.stringify(r.toJSON())))
        );

      if (!user) {
        throw "no user";
      }

      if (
        (user.Job as any) == "Individual Contributor" ||
        (user.Job as any) == "IC"
      )
        user.Job = JobName.IC;

      if (game.CurrentRound) {
        console.log("FOUDN CURRENT ROUND", game.CurrentRound);
        if (game.CurrentRound.UserJobs)
          user.Job = game.CurrentRound.UserJobs[user._id] || JobName.IC;
      }

      console.log(user, game.Teams);

      let team: TeamModel;

      team =
        game.Teams.filter((team) => {
          return team.Players.indexOf(user._id) != -1;
        })[0] || null;

      console.log("TEAM IS: ", team);

      if (
        !team &&
        (user.Role == RoleName.FACILITATOR || user.Role == RoleName.ADMIN)
      ) {
        team = new TeamModel();
        team.GameId = game._id;
        team.Players = [user];
        team._id = game.Teams[0]._id;
      } else if (!team) {
        throw "no team";
      }

      const token = jwt.sign(JSON.stringify(user), "zigwagytywu");

      return res.json({ user, token, team });
    } catch (err) {
      console.log("LoginCtrl ");

      console.log(err);
      res.status(500).send(err);
    }
  }

  public async AdminLogin(req: Request, res: Response): Promise<any> {
    console.log("ADMIN", req.body);

    const user = req.body as UserModel;
    //const dbRoundModel = new monRoundModel(roundToSave);
    try {
      Passport.authenticate(
        "local",
        { session: false },
        (err, user: UserModel, info) => {
          console.log("ERROR IN AUTH METHOD", err);
          if (err || !user) {
            return res.status(501).json({
              message: info ? info.message : "Login failed",
              user: user,
            });
          }

          req.login(user, { session: false }, async (err) => {
            console.log("USER AS PASSED FROM AUTH:", user);
            if (err) {
              res.send(err);
            }

            if (user.Role != RoleName.ADMIN) {
              res.send("You aren't authorized to do that");
            }

            const token = jwt.sign(JSON.stringify(user), "zigwagytywu");

            return res.json({ user, token, team: new TeamModel() });
          });
        }
      )(req, res);
    } catch (error) {
      console.log(error);
      res.send("couldn't login");
    }
  }

  public routes() {
    //this.router.all("*", cors());
    this.router.get("/", this.Login.bind(this));
    this.router.post("/", this.Login.bind(this));
    this.router.post("/admin", this.AdminLogin.bind(this));
  }
}

//this is exported along with the above class so that the above can be used in other routers
const LoginCtrl = new LoginCtrlClass().router;
export default LoginCtrl;
