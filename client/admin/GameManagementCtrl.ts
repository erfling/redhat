import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import BaseController from "../../shared/entity-of-the-state/BaseController";
import { Component } from 'react';
import Game from '../game/Game';
import Admin from './Admin';
import DefaultAdmin from './DefaultAdmin'
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminLogin from '../login/AdminLogin'
import GameList from './GameList'
import GameDetail from './GameDetail'
import ApplicationCtrl from '../ApplicationCtrl'
import { RoleName } from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import GameModel from '../../shared/models/GameModel';
import { plainToClass, plainToClassFromExist, classToPlain } from 'class-transformer';

export default class GameManagementCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    protected readonly ComponentStates = {
        gameList: GameList,
        gamedetail: GameDetail,
        game: Game,
        adminLogin: AdminLogin
    };


    dataStore: AdminViewModel & ICommonComponentState

    component: any;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {

        super(null, reactComp);
        this.CurrentLocation = this.component.props.location.pathname;

        this.component = reactComp;
        

        //if we don't have a user, go to admin login.
        if(!ApplicationViewModel.CurrentUser || !ApplicationViewModel.Token){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin) as FiStMa<any>;
        } 
        //if we have a user, but not an admin, go to game login
        else if (!ApplicationViewModel.CurrentUser || ApplicationViewModel.CurrentUser.Role != RoleName.ADMIN) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else{
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname));
        }

        
        this.dataStore = Object.assign(new AdminViewModel(), {
            ComponentFistma: this.ComponentFistma,
            IsLoading: true
        })

        if(this.component.componentWillMount == undefined){
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
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
            console.log("Users ARE: ",r)
            this.dataStore.Users = r;
            
            this.dataStore.IsLoading = false;
        })
    }

    public createOrEditGame(game?: GameModel){
        this.dataStore.ModalObject = Object.assign(new GameModel(), game) || new GameModel();
        if(!this.dataStore.ModalObject.DatePlayed) this.dataStore.ModalObject.DatePlayed = new Date().toLocaleDateString();
        console.log(this.dataStore.ModalObject.DatePlayed)

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

    public navigateToGameDetail(game: GameModel){
        this.navigateOnClick("/admin/gamedetail/" + game._id)
    }

    public getGame( id: string ){
        const game: GameModel = this.dataStore.Games.filter(g => g._id == id)[0] || new GameModel()
        this.dataStore.IsLoading = true;
        return SapienServerCom.GetData(null, GameModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/" + id)
                                .then(r => {
                                    Object.assign(game, r);
                                    this.dataStore.SelectedGame = game;
                                    this.dataStore.IsLoading = false;
                                })
    }
}