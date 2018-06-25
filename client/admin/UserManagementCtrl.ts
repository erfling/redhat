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
import ApplicationCtrl from '../ApplicationCtrl'
import UserModel, { RoleName } from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import GameModel from '../../shared/models/GameModel';
import { plainToClass, plainToClassFromExist, classToPlain } from 'class-transformer';
import AdminCtrl from './AdminCtrl';
import UserList from './UserList';
import DataStore from '../../shared/base-sapien/client/DataStore';

export default class UserManagementCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------


    dataStore: any;

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
        
        //this.dataStore = DataStore.Admin
        this.dataStore = AdminCtrl.GetInstance().dataStore;

        this.component.componentWillMount = () => {
            this.getAllUsers();
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
        if(!this.dataStore.Users || !this.dataStore.Users.length){
            return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
                console.log("Users ARE: ",r)
                this.dataStore.Users = r;            
                this.dataStore.IsLoading = false;
            })
        }
    }

    public createOrEditUser(user?: UserModel){
        this.dataStore.ModalObject = Object.assign(new UserModel(), user) || new GameModel();
        this.openModal();
    }
    
    public saveUser(user: UserModel){
        this.dataStore.FormIsSubmitting = true;
        SapienServerCom.SaveData(user, SapienServerCom.BASE_REST_URL + "user")
                        .then(r => {
                            if(user._id){
                                this.dataStore.Users = this.dataStore.Users.map(u => {
                                    return u._id == user._id ? Object.assign(user, r) : u
                                })
                            } else {
                                console.log(r, Object.assign(new UserModel(), r))
                                this.dataStore.Users = this.dataStore.Users.concat(Object.assign(new UserModel(), r))
                            }
                            console.log("USERS ARE", AdminCtrl.GetInstance().dataStore.Users)
                            this.dataStore.FormIsSubmitting = false;
                            this.closeModal();
                        })
    }

    public DeleteUser(user: UserModel){
        return SapienServerCom.DeleteData(user, SapienServerCom.BASE_REST_URL + "user").then(r => {
            this.dataStore.Users = this.dataStore.Users.filter(u => u._id != user._id);
            console.log(AdminCtrl.GetInstance().dataStore.Users, this.dataStore.Users)
            this.dataStore.DeletionUser = null; 
        })
    }
}