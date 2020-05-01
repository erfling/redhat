import { Slider } from "react-semantic-ui-range";
import { Label } from "semantic-ui-react";
import { Router, Request, Response, NextFunction } from "express";
import * as mongoose from "mongoose";
import RoundModel from "../../shared/models/RoundModel";
import SchemaBuilder from "../SchemaBuilder";
import SubRoundModel from "../../shared/models/SubRoundModel";
import MessageModel from "../../shared/models/MessageModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import AuthUtils, { PERMISSION_LEVELS } from "../AuthUtils";
import { monResponseModel } from "./GamePlayCtrl";
import ResponseModel from "../../shared/models/ResponseModel";
import ValueObj, {
  SliderValueObj,
} from "../../shared/entity-of-the-state/ValueObj";
import QuestionModel, {
  QuestionType,
  ComparisonLabel,
} from "../../shared/models/QuestionModel";
import { monGameModel, monMappingModel } from "./GameCtrl";
import TeamModel from "../../shared/models/TeamModel";
import GameModel from "../../shared/models/GameModel";
import SubRoundFeedback, {
  ValueDemomination,
} from "../../shared/models/SubRoundFeedback";
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import * as Passport from "passport";
import { monTeamModel } from "./TeamCtrl";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";
import { monRoundChangeLookupModel } from "./FacilitationCtrl";
import { sortBy, orderBy } from "lodash";
import { monUserModel } from "./UserCtrl";




class RoundRouter {
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

    //console.log("monSchema:", monRoundModel);
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

  public async GetLookups(req: Request, res: Response): Promise<any> {
    console.log("CALLING GET Lookups");

    try {
      const lookups = await monRoundChangeLookupModel.find();
      if (!lookups) {
        return res.status(400).json({ error: "No round changes found" });
      } else {
        const status = res.status;
        return res.json(lookups);
      }
    } catch (err) {
      console.log("ERROR", err);
      (err: any) => res.status(500).json({ error: err });
    }
  }

  

  public routes() {
    //this.router.all("*", cors());
    this.router.get("/", this.GetLookups.bind(this));
   
    //this.router.get("/changes/makeroundchanges", this.createSlideMappings.bind(this))
  }
}

export default new RoundRouter().router;
