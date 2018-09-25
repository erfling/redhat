'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { Component } from 'react';
import BaseClientCtrl, { IControllerDataStore } from '../../shared/base-sapien/client/BaseClientCtrl';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import GameModel from '../../shared/models/GameModel';
import TeamModel from '../../shared/models/TeamModel';
import ApplicationCtrl from '../ApplicationCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../shared/base-sapien/client/ComponentsVO';
import AdminCtrl from './AdminCtrl';

export default class GameManagementCtrl extends BaseClientCtrl<IControllerDataStore & { Admin: AdminViewModel, ShowUserModal: boolean, ShowGameModal: boolean, ShowTeamDeleteModal: boolean }>
{
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

    public static GetInstance(reactComp?: Component<any, any>): GameManagementCtrl {
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
        const team = new TeamModel();
        team.GameId = game._id;
        team.Number = game.Teams.length + 1;
        const player = new UserModel();
        player.EditMode = true;
        team.Players = team.Players.concat(player)
        game.Teams = game.Teams.concat(team);
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public getAllGames() {
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "games").then(r => {
            console.log("GAMES ARE: ", r)
            this.dataStore.Admin.Games = r;
            this.dataStore.Admin.FilteredGames = r;
            this.dataStore.ApplicationState.IsLoading = false;
        })
    }

    public getAllUsers() {
        if (!this.dataStore.Admin.Users || !this.dataStore.Admin.Users.length) {
            return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
                this.dataStore.Admin.Users = r;
                this.dataStore.ApplicationState.IsLoading = false;
                return this.dataStore.Admin.Users;
            })
        } else {
            return new Promise((resolve, reject) => {
                return resolve(this.dataStore.Admin.Users);
            })
        }
    }

    public createOrEditGame(game?: GameModel) {
        this.dataStore.ApplicationState.ModalObject = Object.assign(new GameModel(), game) || new GameModel();
        if (!this.dataStore.ApplicationState.ModalObject.DatePlayed) this.dataStore.ApplicationState.ModalObject.DatePlayed = new Date().toLocaleDateString();
        this.dataStore.ShowGameModal = true;
        this.openModal();
    }

    public saveGame(game: GameModel) {
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        return SapienServerCom.SaveData(game, SapienServerCom.BASE_REST_URL + "games")
            .then(r => {
                if (game._id) {
                    this.dataStore.Admin.Games = this.dataStore.Admin.Games.map(g => {
                        return g._id == game._id ? Object.assign(game, r) : g
                    })
                    this.dataStore.Admin.FilteredGames = this.dataStore.Admin.FilteredGames.map(g => {
                        return g._id == game._id ? Object.assign(game, r) : g
                    })
                } else {
                    console.log(r, Object.assign(new GameModel(), r))
                    this.dataStore.Admin.Games = this.dataStore.Admin.Games.concat(Object.assign(new GameModel(), r));
                    this.dataStore.Admin.FilteredGames = this.dataStore.Admin.FilteredGames.concat(Object.assign(new GameModel(), r))
                }
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                this.closeModal();
                ApplicationCtrl.GetInstance().addToast("Save successful")
                return r;
            }).catch(() => {
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("There was a problem saving the game", "danger");
            })
    }

    public saveTeam(team: TeamModel, game: GameModel) {
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        return SapienServerCom.SaveData(team, SapienServerCom.BASE_REST_URL + "games/team")
            .then(r => {
                team = Object.assign(game, r)
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("Save successful");
            }).catch(() => {
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("There was a problem saving the game", "danger")
            })
    }

    public navigateToGameDetail(game: GameModel) {
        this.component.props.history.push("/admin/gamedetail/" + game._id)
    }

    public facilitateGame(game: GameModel) {
        this.component.props.history.push("/facilitator/base/" + game._id)
    }

    public getGame(id: string) {
        const game: GameModel = new GameModel()
        this.dataStore.ApplicationState.IsLoading = true;
        return SapienServerCom.GetData(null, GameModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/" + id)
            .then(r => {
                Object.assign(game, r);
                this.dataStore.Admin.SelectedGame = game;
                this.dataStore.ApplicationState.IsLoading = false;
                return this.dataStore.Admin.SelectedGame;
            })
    }

    public filterUsersByGame(game: GameModel): void {
        const users: UserModel[][] = game.Teams.map(t => t.Players);
        console.log("USERS", users)
        //const merged: UserModel[] = [].concat.apply([], users);
        let flatUsers: UserModel[] = [];
        users.forEach((u: UserModel[]) => {
            u.forEach(iu => {
                flatUsers.push(iu)
            })
        })
        console.log("flatUsers", flatUsers)

        let userIds: string[] = flatUsers.map(u => {
            console.log(u, u._id, u.FirstName, u.Email)
            return u._id
        });

        console.log("usedUserIdsusedUserIdsusedUserIdsusedUserIdsusedUserIdsusedUserIds", userIds)
        this.dataStore.Admin.AvailablePlayers = this.dataStore.Admin.Users.filter(u => u._id && userIds.indexOf(u._id) == -1).map((u, i) => {
            console.log("FILTERING A USER", u)
            return {
                text: u.FirstName + " " + u.LastName + " (" + u.Email + ")",
                value: u._id,
                key: i
            }
        })
    }

    public addPlayer(team: TeamModel): void {
        this.dataStore.ApplicationState.ModalTarget = team;
        this.dataStore.ApplicationState.ModalObject = new UserModel();
        this.openModal();
    }

    public saveUser(user: UserModel) {
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        return SapienServerCom.SaveData(user, SapienServerCom.BASE_REST_URL + "user")
            .then(r => {
                var returnedUser: UserModel = Object.assign(new UserModel(), r);
                returnedUser.EditMode = false;
                console.log(r, Object.assign(new UserModel(), r))
                this.dataStore.Admin.Users = this.dataStore.Admin.Users.concat(returnedUser);
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                this.dataStore.ApplicationState.ModalTarget.Players = this.dataStore.ApplicationState.ModalTarget.Players.filter(p => p._id != null).concat(returnedUser)
                this.closeModal();
                return returnedUser;
            })
    }

    public DeleteTeam(team: TeamModel) {
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        return SapienServerCom.SaveData(team, SapienServerCom.BASE_REST_URL + "games/team/delete")
            .then(r => {
                //team = Object.assign(team, r)
                this.dataStore.Admin.SelectedGame = r;
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                this.closeModal();
                ApplicationCtrl.GetInstance().addToast("Team successfully deleted");
            }).catch(() => {
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("There was a problem deleting the team", "danger")
            })

    }

    public DeleteGame(game: GameModel){
        return SapienServerCom.DeleteData(game, SapienServerCom.BASE_REST_URL + "games").then(r => {
            this.dataStore.Admin.Games = this.dataStore.Admin.Games.filter(g => g._id != game._id);
            this.dataStore.Admin.FilteredGames = this.dataStore.Admin.FilteredGames.filter(g => g._id != game._id);
            
            console.log(AdminCtrl.GetInstance().dataStore.Admin.Games)
            this.dataStore.Admin.DeletionGame = null; 
            ApplicationCtrl.GetInstance().addToast("The game was successfully removed")

        }).catch(() => {
            ApplicationCtrl.GetInstance().addToast("The game could not be deleted","danger red")
        })
    }
    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        var compStates = {
            gameList: ComponentsVO.GameList,
            gamedetail: ComponentsVO.GameDetail,
            game: ComponentsVO.Game,
            adminLogin: ComponentsVO.AdminLogin
        };

        this.ComponentFistma = new FiStMa(compStates, compStates.adminLogin);



        this.dataStore = {
            Admin: DataStore.Admin,
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma,
            ShowGameModal: false,
            ShowTeamDeleteModal: false,
            ShowUserModal: false
        }

        this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.Users.map(u => u);
        this.dataStore.Admin.FilterGames = this.dataStore.Admin.Games.map(g => g);
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

        console.log(value, this.dataStore.Admin.GameFilter)
        this.dataStore.Admin.FilteredGames = this.dataStore.Admin.Games.filter(g => {

            let match = true;
            if (prop != "Facilitator") {
                for (let p in this.dataStore.Admin.GameFilter) {
                    if (g[prop].toUpperCase().indexOf(this.dataStore.Admin.GameFilter[prop]) == -1) {
                        match = false;
                    }
                }
            } else {
                console.log((g.Facilitator.FirstName + " " + g.Facilitator.LastName).toUpperCase(), this.dataStore.Admin.GameFilter[prop])
                if((g.Facilitator.FirstName + " " + g.Facilitator.LastName).toUpperCase().indexOf(this.dataStore.Admin.GameFilter[prop]) == -1) match = false;
            }


            return match;
        })
    }


}