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

export default class GameManagementCtrl extends BaseClientCtrl<
  IControllerDataStore & {
    Admin: AdminViewModel;
    ShowUserModal: boolean;
    ShowGameModal: boolean;
    ShowTeamDeleteModal: boolean;
  }
> {
  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  private static _instance: GameManagementCtrl;

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
      console.log("GAMES ARE: ", r);
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
      console.log("GAMES ARE: ", r);
      this.dataStore.Admin.RoundChangeLookups = r;
      this.dataStore.ApplicationState.IsLoading = false;
    });
  }

  public async saveRound(round: RoundModel) {
    this.dataStore.Admin.SavingRoundId = round.id;

    const r: RoundModel = await SapienServerCom.SaveData(
      round,
      SapienServerCom.BASE_REST_URL + "rounds"
    );
    console.log("ROUND", round)
    await this.getAllRounds();
    this.dataStore.Admin.SavingRoundId = -1;
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
      ShowGameModal: false,
      ShowTeamDeleteModal: false,
      ShowUserModal: false,
    };
  }

  OpenUserModal(user: UserModel) {
    this.dataStore.ApplicationState.ModalObject = user;
    this.dataStore.ShowUserModal = true;
  }

  OpenGameModal(game: GameModel) {
    this.dataStore.ApplicationState.ModalObject = game;
    this.dataStore.ShowGameModal = true;
  }

  OpenTeamModal(team: TeamModel) {
    this.dataStore.ApplicationState.ModalObject = team;
    this.dataStore.ShowTeamDeleteModal = true;
  }

  closeModal() {
    super.closeModal();
    this.dataStore.ShowTeamDeleteModal = false;
    this.dataStore.ShowGameModal = false;
    this.dataStore.ShowUserModal = false;
  }

  public FilterGames(prop: string, value: string) {
    value = value.toUpperCase();

    this.dataStore.Admin.GameFilter[prop] = value;

    console.log(value, this.dataStore.Admin.GameFilter);
    this.dataStore.Admin.FilteredGames = this.dataStore.Admin.Games.filter(
      (g) => {
        let match = true;
        if (prop != "Facilitator") {
          for (let p in this.dataStore.Admin.GameFilter) {
            if (
              g[prop]
                .toUpperCase()
                .indexOf(this.dataStore.Admin.GameFilter[prop]) == -1
            ) {
              match = false;
            }
          }
        } else {
          console.log(
            (
              g.Facilitator.FirstName +
              " " +
              g.Facilitator.LastName
            ).toUpperCase(),
            this.dataStore.Admin.GameFilter[prop]
          );
          if (
            (g.Facilitator.FirstName + " " + g.Facilitator.LastName)
              .toUpperCase()
              .indexOf(this.dataStore.Admin.GameFilter[prop]) == -1
          )
            match = false;
        }

        return match;
      }
    );
  }
}
