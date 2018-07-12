import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import { Component } from 'react';
import Game from '../game/Game';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminLogin from '../login/AdminLogin';
import GameList from './GameList';
import GameDetail from './GameDetail';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import GameModel from '../../shared/models/GameModel';
import TeamModel from '../../shared/models/TeamModel';
import AdminCtrl from './AdminCtrl';
import ApplicationCtrl from '../ApplicationCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';


export default class GameManagementCtrl extends BaseClientCtrl<IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    dataStore: IControllerDataStore & {Admin: AdminViewModel}

    protected readonly ComponentStates = {
        gameList: GameList,
        gamedetail: GameDetail,
        game: Game,
        adminLogin: AdminLogin
    };

    private static _instance: GameManagementCtrl;


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp?: Component<any, any>) {
        super( reactComp ? Object.assign(new GameModel()) : null, reactComp || null);

        this.CurrentLocation = this.component.props.location.pathname;

        if (reactComp) this._setUpFistma(reactComp)

    }

    public static GetInstance(reactComp?: Component<any, any>): GameManagementCtrl {
        if (!this._instance) {
            this._instance = new GameManagementCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE")
        if (reactComp) this._instance._setUpFistma(reactComp)
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
            this.dataStore.ApplicationState.IsLoading = false;
        })
    }

    public getAllUsers() {
        if (!this.dataStore.Admin.Users || !this.dataStore.Admin.Users.length) {
            return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
                console.log("Users ARE: ", r)
                this.dataStore.Admin.Users = r;
                this.dataStore.ApplicationState.IsLoading = false;
                return this.dataStore.Admin.Users;
            })
        } else {
            return new Promise((resolve, reject) => {
                console.log("USERS ARE", this.dataStore.Admin.Users)
                return resolve(this.dataStore.Admin.Users);
            })
        }
    }

    public createOrEditGame(game?: GameModel) {

        console.log("WE PASSED THIS GAME", game)

        this.dataStore.ApplicationState.ModalObject = Object.assign(new GameModel(), game) || new GameModel();
        if (!this.dataStore.ApplicationState.ModalObject.DatePlayed) this.dataStore.ApplicationState.ModalObject.DatePlayed = new Date().toLocaleDateString();

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
                } else {
                    console.log(r, Object.assign(new GameModel(), r))
                    this.dataStore.Admin.Games = this.dataStore.Admin.Games.concat(Object.assign(new GameModel(), r))
                }                
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                this.closeModal();
                ApplicationCtrl.GetInstance().addToast("Save successful")
                return r;
            }).catch(() => {
                this.closeModal();
                ApplicationCtrl.GetInstance().addToast("There was a problem saving the game", "danger");
            })
    }

    public saveTeam(team: TeamModel) {
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        return SapienServerCom.SaveData(team, SapienServerCom.BASE_REST_URL + "games/team")
            .then(r => {
                team = Object.assign(team, r)
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("Save successful");
            }).catch(() => {
                this.dataStore.ApplicationState.FormIsSubmitting = false;
                ApplicationCtrl.GetInstance().addToast("There was a problem saving the game", "danger")
            })
    }

    public navigateToGameDetail(game: GameModel) {
        this.navigateOnClick("/admin/gamedetail/" + game._id);
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
        const usedUserIds: string[] = game.Teams.map(t => t.Players).reduce((a, b) => a.concat(b), []).map(p => p._id)

        this.dataStore.Admin.AvailablePlayers = this.dataStore.Admin.Users.filter(u => u._id && usedUserIds.indexOf(u._id) == -1).map((u, i) => {
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

    private _setUpFistma(reactComp: Component) {

        this.component = reactComp;
        this.dataStore = {
            Admin: DataStore.Admin,
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null
        }

        //if we don't have a user, go to admin login.
        if (!this.dataStore.ApplicationState.CurrentUser) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin) as FiStMa<any>;
        }
        //if we have a user, but not an admin, go to game login
        else if (!this.dataStore.ApplicationState.CurrentUser || this.dataStore.ApplicationState.CurrentUser.Role != RoleName.ADMIN) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname));
        }

        this.ComponentFistma.addTransition(this.ComponentStates.game)
        this.ComponentFistma.addTransition(this.ComponentStates.gameList)
        this.ComponentFistma.addTransition(this.ComponentStates.gamedetail)
        this.ComponentFistma.addTransition(this.ComponentStates.adminLogin)


        if (this.component.componentWillMount == undefined) {
            this.component.componentWillMount = () => {
                //this.component.constructor.super(this.component.props).componentWillMount()
                console.log("MOUNTED: ", this.component, this.component.props.location.pathname);
                this.navigateOnClick(this.component.props.location.pathname);
                this.getAllGames();
                this.getAllUsers();
            }
        }

        this.dataStore.ComponentFistma = this.ComponentFistma;

    }

}