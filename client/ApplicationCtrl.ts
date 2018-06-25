import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import ApplicationViewModel from '../shared/models/ApplicationViewModel';
import { Component } from 'react';
import BaseClientCtrl from '../shared/base-sapien/client/BaseClientCtrl';

import Game from './game/Game';
import Admin from './admin/Admin'
import Login from './login/Login'
import ICommonComponentState from '../shared/base-sapien/client/ICommonComponentState';
import DataStore from '../shared/base-sapien/client/DataStore';

export default class ApplicationCtrl extends BaseClientCtrl<ApplicationViewModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    dataStore: ICommonComponentState & {ComponentFistma?: FiStMa<any>};

    private static _instance: ApplicationCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    
    private constructor(reactComp: Component<any, any>) {
        super( DataStore.ApplicationState, reactComp );
        this.ComponentStates = {
            game: Game,
            admin: Admin,
            login: Login
        };
        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel()
        this.dataStore = DataStore.ApplicationState;

        this.CurrentLocation = this.component.props.location.pathname;
        
        if(this.dataStore.CurrentUser && this.dataStore.CurrentUser.Role == RoleName.ADMIN || this.UrlToComponent(this.CurrentLocation) == this.ComponentStates.admin){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.admin);
        } else {
            this.ComponentFistma =  new FiStMa(this.ComponentStates, this.ComponentStates.game);
        }
           
        this.ComponentFistma = this.ComponentFistma;

        console.log(this.component.props);

        this.ComponentFistma.addTransition(this.ComponentStates.game);
        this.ComponentFistma.addTransition(this.ComponentStates.admin);
 
    }
    
    public static GetInstance(reactComp: Component<any, any>): ApplicationCtrl {
        if (!this._instance) {
            this._instance = new ApplicationCtrl(reactComp);
        }
        return this._instance;
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



}