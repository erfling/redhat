import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import { Component } from 'react';
import GameList from './GameList';
import DefaultAdmin from './DefaultAdmin'
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminLogin from '../login/AdminLogin'
import GameLogin from '../login/GameLogin'
import UserList from './UserList';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import GameDetail from './GameDetail';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import DataStore from '../../shared/base-sapien/client/DataStore';

export default class AdminCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: AdminCtrl;

    public dataStore: AdminViewModel & ICommonComponentState & {ComponentFistma?: FiStMa<any>};

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: Component<any, any>) {
        super(null, reactComp);
        
        this.dataStore = DataStore.Admin;

        this.ComponentStates = {
            game: GameList,
            gameDetail: GameDetail,
            users: UserList,
            adminLogin: AdminLogin,
            default: DefaultAdmin,
            gameLogin: GameLogin
        };

        //if we don't have a user, go to admin login.
        if (!ApplicationViewModel.CurrentUser || !ApplicationViewModel.Token){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        } 
        //if we have a user, but not an admin, go to game login
        else if (!ApplicationViewModel.CurrentUser || ApplicationViewModel.CurrentUser.Role != RoleName.ADMIN) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else {
            console.log("HEY YOU",this.component.props.location);
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname) || this.ComponentStates.default);
        }

        this.ComponentFistma.addTransition(this.ComponentStates.adminLogin)
        this.ComponentFistma.addTransition(this.ComponentStates.default)
        this.ComponentFistma.addTransition(this.ComponentStates.game)
        this.ComponentFistma.addTransition(this.ComponentStates.gameLogin)
        this.ComponentFistma.addTransition(this.ComponentStates.users)
        this.ComponentFistma.onInvalidTransition(() => {
            alert("INVALID")
        });

        this.ComponentFistma.addOnEnter("*", () => {
            console.warn("ADMIN ON ENTER", this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME)
            this.component.forceUpdate();
        })

        this.component.componentDidUpdate = (prevProps, prevState, snapshot) => {
            //alert(this.component.props.location.pathname + " asdf " + prevProps.location.pathname)
            console.log("ADMIN DID UPDATE", this.component.props.location.pathname, prevProps.location.pathname, this.component.props.location.pathname == prevProps.location.pathname)
            this.conditionallyNavigate(this.component.props.location.pathname, prevProps.location.pathname)
        }
/*
        setTimeout(() => {
            //DataStore.Admin.Users.push(new UserModel());
            var test = new UserModel();
            test.FirstName = "HEY THIS IS OUR TEST"
            this.dataStore.Users = this.dataStore.Users.concat(test);
            console.log(this.dataStore, DataStore.Admin)
        },2000)*/
    }

    
    public static GetInstance(reactComp?: Component<any, any>): AdminCtrl {
        if (!this._instance && reactComp) {
            this._instance = new AdminCtrl(reactComp);
        }
        if (!this._instance) throw new Error("NO INSTANCE")

        return this._instance;
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
 

}