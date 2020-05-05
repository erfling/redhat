"use strict";
import FiStMa from "../../shared/entity-of-the-state/FiStMa";
import AdminViewModel from "../../shared/models/AdminViewModel";
import { Component } from "react";
import BaseClientCtrl, {
  IControllerDataStore,
} from "../../shared/base-sapien/client/BaseClientCtrl";
import UserModel, { RoleName } from "../../shared/models/UserModel";
import SapienServerCom from "../../shared/base-sapien/client/SapienServerCom";
import GameModel from "../../shared/models/GameModel";
import TeamModel from "../../shared/models/TeamModel";
import ApplicationCtrl from "../ApplicationCtrl";
import DataStore from "../../shared/base-sapien/client/DataStore";
import ComponentsVO from "../../shared/base-sapien/client/ComponentsVO";
import AdminCtrl from "./AdminCtrl";
import RoundModel from "../../shared/models/RoundModel";
import SubRoundModel from "../../shared/models/SubRoundModel";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";

export default class GameManagementCtrl extends BaseClientCtrl<
  IControllerDataStore & {
    Admin: AdminViewModel;
    IsShowingInactiveObjects: boolean
  }
> {
  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  private static _instance: GameManagementCtrl;
  private savingTimeout;

  //----------------------------------------------------------------------
  //
  //  Constructor
  //
  //----------------------------------------------------------------------

  private constructor(reactComp?: Component<any, any>) {
    super(null, reactComp || null);
  }

  public static GetInstance(
    reactComp?: Component<any, any>
  ): GameManagementCtrl {
    if (!this._instance) {
      this._instance = new GameManagementCtrl(reactComp || null);
      if (!this._instance) throw new Error("NO INSTANCE");
    } else if (reactComp) this._instance._setUpFistma(reactComp);

    return this._instance;
  }

  //----------------------------------------------------------------------
  //
  //  Event Handlers
  //
  //----------------------------------------------------------------------

  public addTeamToGame(game: GameModel) {
    let team = new TeamModel();
    team.Number = game.Teams.length + 1;
    team.GameId = game._id;

    while (team.Players.length < 4) {
      let player = new UserModel();
      player.EditMode = true;
      team.Players = team.Players.concat(player);
    }

    game.Teams = game.Teams.concat(team);
  }

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  public getAllRounds() {
    return SapienServerCom.GetData(
      null,
      null,
      SapienServerCom.BASE_REST_URL + "rounds/with-subrounds"
    ).then((r) => {
      this.dataStore.Admin.Rounds = r;
      this.dataStore.ApplicationState.IsLoading = false;
    });
  }

  public getAllRoundChangeLookups() {
    return SapienServerCom.GetData(
      null,
      null,
      SapienServerCom.BASE_REST_URL + "round-change-lookups"
    ).then((r) => {
      this.dataStore.Admin.RoundChangeLookups = r;
      this.dataStore.ApplicationState.IsLoading = false;
    });
  }

  private setDirty() {
    this.dataStore.Admin.IsSaving = true;
    if (this.savingTimeout) clearTimeout(this.savingTimeout);
    this.dataStore.Admin.HasError = false;
    this.dataStore.Admin.IsDirty = true;
    this.dataStore.Admin.IsClean = false;
  }
  private setClean() {
    this.dataStore.Admin.IsSaving = false;
    this.dataStore.Admin.HasError = false;
    this.dataStore.Admin.IsDirty = false;
    this.dataStore.Admin.IsClean = true;
    this.dataStore.Admin.EditedRound = null;
    this.dataStore.Admin.EditedSubRound = null;
    this.dataStore.Admin.EditedRCL = null;
    this.savingTimeout = setTimeout(() => {
      this.dataStore.Admin.IsClean = false;
    }, 5000);
  }
  private setError() {
    this.dataStore.Admin.IsSaving = false;
    this.dataStore.Admin.IsDirty = false;
    this.dataStore.Admin.IsClean = false;
    this.dataStore.Admin.HasError = true;
  }
  public async saveRound(round: RoundModel | any) {
    this.setDirty();

    try {
      this.dataStore.Admin.SavingRoundId = round.id;
      const r: RoundModel = await SapienServerCom.SaveData(
        round,
        SapienServerCom.BASE_REST_URL + "rounds"
      );
      await this.getAllRounds();
      this.setClean();
    } catch (error) {
      console.error(error);
      this.setError();
    }

    this.dataStore.Admin.SavingRoundId = -1;
  }

  public async saveSubRound(subRound: SubRoundModel | any) {
    this.dataStore.Admin.SavingSubRoundId = subRound.id;
    this.setDirty();
    try {
      const r: RoundModel = await SapienServerCom.SaveData(
        subRound,
        SapienServerCom.BASE_REST_URL + "rounds/subround"
      );
      console.log("ROUND", subRound);
      await this.getAllRounds();
      this.setClean();
    } catch (error) {
      console.error(error);
      this.setError();
    }

    this.dataStore.Admin.SavingSubRoundId = -1;
  }

  public async saveRoundChangeLookup(lookup: RoundChangeLookup | any) {
    console.log("SAVING", lookup);
    this.dataStore.Admin.SavingLookupId = lookup.id;
    this.setDirty();
    try {
      const r: RoundModel = await SapienServerCom.SaveData(
        lookup,
        SapienServerCom.BASE_REST_URL + "rounds/rounchangelookup"
      );
      console.log("LOOkup HEY", lookup);
      await this.getAllRoundChangeLookups();
      this.setClean();
    } catch (error) {
      console.error(error);
      this.setError();
    }
    this.dataStore.Admin.SavingLookupId = -1;
  }

  protected _setUpFistma(reactComp: Component) {
    this.component = reactComp;
    var compStates = {
      rounds: ComponentsVO.GameList,
    };

    this.ComponentFistma = new FiStMa(compStates, compStates.rounds);

    this.dataStore = {
      Admin: DataStore.Admin,
      ApplicationState: DataStore.ApplicationState,
      ComponentFistma: this.ComponentFistma,
      IsShowingInactiveObjects: true
    };
  }



  closeModal() {
    super.closeModal();
    this.dataStore.Admin.EditedRound = null;
    this.dataStore.Admin.EditedSubRound = null;
    this.dataStore.Admin.EditedRCL = null;
  }
}
