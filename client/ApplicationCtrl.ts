import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import ApplicationViewModel from '../shared/models/ApplicationViewModel'
import SapienServerCom from '../shared/base-sapien/client/SapienServerCom';

import BaseGameCtrl from '../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import BaseClientCtrl from '../shared/base-sapien/client/BaseClientCtrl';

import Game from './game/Game';
import Admin from './admin/Admin'
import Login from './login/Login'
import ICommonComponentState from '../shared/base-sapien/client/ICommonComponentState';

export default class ApplicationCtrl extends BaseClientCtrl<ApplicationViewModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    protected readonly ComponentStates = {
        game: Game,
        admin: Admin,
        login: Login
    };

    component: any;

    static dataStore: ApplicationViewModel & ICommonComponentState & {ShowMenu: boolean};

    private static _instance: ApplicationCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    
    private constructor(reactComp: Component<any, any>) {
        super( null, reactComp );
        this.component = reactComp;
        this.CurrentLocation = this.component.props.location.pathname;        

        if(this.CurrentUser && this.CurrentUser.Role == RoleName.ADMIN || this.UrlToComponent(this.CurrentLocation) == this.ComponentStates.admin){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.admin);
        } else {
            this.ComponentFistma =  new FiStMa(this.ComponentStates, this.ComponentStates.game);
        }
           
        console.log(this.component.props);

        this.ComponentFistma.addTransition(this.ComponentStates.game);
        this.ComponentFistma.addTransition(this.ComponentStates.admin);

        
        this.dataStore = Object.assign(new ApplicationViewModel(), {
            ComponentFistma: this.ComponentFistma,
            CurrentUser: localStorage.getItem("RH_USER") || null,
            ShowMenu: false,
            Users: [],
            Games: []
        })

        console.log(this.component.props)
    }
    
    public static GetInstance(reactComp: Component<any, any>): ApplicationCtrl {
        if (!ApplicationCtrl._instance) {
            ApplicationCtrl._instance = new ApplicationCtrl(reactComp);
        }
        return ApplicationCtrl._instance;
    }
    

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------
  
    public signOut(): void{
        localStorage.removeItem("RH_USER");
        localStorage.removeItem("rhjwt");
        this.navigateOnClick("/login/admin")
    }


    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    get AdminUserLoggedIn(): boolean {
        let store: ApplicationViewModel = this.dataStore as ApplicationViewModel;
        return ApplicationViewModel.Token && ApplicationViewModel.CurrentUser && ApplicationViewModel.CurrentUser.Role == RoleName.ADMIN;
    }

    get CurrentUser(): UserModel {        
        return ApplicationViewModel.CurrentUser;
    }

    getCurrentState(){
        //default to game as current state, unless user is logged in and is an admin
        if(this.dataStore.CurrentUser && this.dataStore.CurrentUser.Role == RoleName.ADMIN || this.UrlToComponent(this.CurrentLocation) == this.ComponentStates.admin){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.admin);
        } else {
            this.ComponentFistma =  new FiStMa(this.ComponentStates, this.ComponentStates.game);
        }
        return this.ComponentFistma
    }

}