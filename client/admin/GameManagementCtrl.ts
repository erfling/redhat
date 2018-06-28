import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import { Component } from 'react';
import Game from '../game/Game';
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminLogin from '../login/AdminLogin';
import GameList from './GameList';
import GameDetail from './GameDetail';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import GameModel from '../../shared/models/GameModel';
import TeamModel from '../../shared/models/TeamModel';
import AdminCtrl from './AdminCtrl';

export default class GameManagementCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    dataStore: AdminViewModel & ICommonComponentState & {AvailablePlayers?: {text: string, value: string, key: number}[], ComponentFistma?: FiStMa<any>};

    protected readonly ComponentStates = {
        gameList: GameList,
        gamedetail: GameDetail,
        game: Game,
        adminLogin: AdminLogin
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( Object.assign(new GameModel()), reactComp);

        this.CurrentLocation = this.component.props.location.pathname;

        //if we don't have a user, go to admin login.
        if (!ApplicationViewModel.CurrentUser || !ApplicationViewModel.Token){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin) as FiStMa<any>;
        } 
        //if we have a user, but not an admin, go to game login
        else if (!ApplicationViewModel.CurrentUser || ApplicationViewModel.CurrentUser.Role != RoleName.ADMIN) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname));
        }
        this.dataStore = AdminCtrl.GetInstance().dataStore;

        if (this.component.componentWillMount == undefined){
            this.component.componentWillMount = () => {
                //this.component.constructor.super(this.component.props).componentWillMount()
                console.log("MOUNTED: ", this.component, this.component.props.location.pathname);
                this.navigateOnClick(this.component.props.location.pathname);
                this.getAllGames();
                this.getAllUsers();
            }
        }

    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
    }

    public addTeamToGame(game: GameModel){
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

    public getAllGames(){
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "games").then(r => {
            console.log("GAMES ARE: ",r)
            this.dataStore.Games = r;
            this.dataStore.IsLoading = false;
        })
    }

    public getAllUsers(){
        if(!this.dataStore.Users || !this.dataStore.Users.length){
            return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
                console.log("Users ARE: ",r)
                this.dataStore.Users = r;            
                this.dataStore.IsLoading = false;
                return this.dataStore.Users;
            })
        } else {
            return new Promise((resolve, reject) => {
                console.log("USERS ARE",this.dataStore.Users)
                return resolve(this.dataStore.Users);
            })
        }
    }

    public createOrEditGame(game?: GameModel){
        this.dataStore.ModalObject = Object.assign(new GameModel(), game) || new GameModel();
        if(!this.dataStore.ModalObject.DatePlayed) this.dataStore.ModalObject.DatePlayed = new Date().toLocaleDateString();
        console.log(this.dataStore.ModalObject.DatePlayed);

        this.openModal();
    }
    
    public saveGame(game: GameModel){
        this.dataStore.FormIsSubmitting = true;
        SapienServerCom.SaveData(game, SapienServerCom.BASE_REST_URL + "games")
                        .then(r => {
                            if(game._id){
                                this.dataStore.Games = this.dataStore.Games.map(g => {
                                    return g._id == game._id ? Object.assign(game, r) : g
                                })
                            } else {
                                console.log(r, Object.assign(new GameModel(), r))
                                this.dataStore.Games = this.dataStore.Games.concat(Object.assign(new GameModel(), r))
                            }
                            this.dataStore.FormIsSubmitting = false;
                            this.closeModal();
                        })
    }

    public saveTeam(team: TeamModel){
        this.dataStore.FormIsSubmitting = true;
        return SapienServerCom.SaveData(team, SapienServerCom.BASE_REST_URL + "games/team")
                        .then(r => {
                            team = Object.assign(team, r)                       
                            this.dataStore.FormIsSubmitting = false;
                        })
    }

    public navigateToGameDetail(game: GameModel){
        this.navigateOnClick("/admin/gamedetail/" + game._id);
    }

    public getGame( id: string ){
        const game: GameModel = new GameModel()
        this.dataStore.IsLoading = true;
        return SapienServerCom.GetData(null, GameModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/" + id)
                                .then(r => {
                                    Object.assign(game, r);
                                    this.dataStore.SelectedGame = game;
                                    this.dataStore.IsLoading = false;
                                    return this.dataStore.SelectedGame;
                                })
    }

    public filterUsersByGame(game: GameModel): void{
        const usedUserIds: string[] = game.Teams.map(t => t.Players).reduce((a,b) => a.concat(b), []).map(p => p._id)

        this.dataStore.AvailablePlayers = this.dataStore.Users.filter(u => u._id && usedUserIds.indexOf(u._id) == -1).map((u, i) => {
            console.log("FILTERING A USER", u)
            return {
                text: u.FirstName + " " + u.LastName + " (" + u.Email + ")",
                value: u._id,
                key: i
            }
        })
    }

    public addPlayer(team: TeamModel): void {
        this.dataStore.ModalTarget = team;
        this.dataStore.ModalObject = new UserModel();
        this.openModal();
    }

    public saveUser(user: UserModel){
        this.dataStore.FormIsSubmitting = true;
        return SapienServerCom.SaveData(user, SapienServerCom.BASE_REST_URL + "user")
                        .then(r => {
                            var returnedUser: UserModel = Object.assign(new UserModel(), r);
                            returnedUser.EditMode = false;
                            console.log(r, Object.assign(new UserModel(), r))
                            this.dataStore.Users = this.dataStore.Users.concat(returnedUser);
                            this.dataStore.FormIsSubmitting = false;
                            this.dataStore.ModalTarget.Players = this.dataStore.ModalTarget.Players.filter(p => p._id != null).concat(returnedUser)
                            this.closeModal();
                            return returnedUser;
                        })
    }
}