import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import ApplicationViewModel from '../shared/models/ApplicationViewModel'
import SapienServerCom from '../shared/base-sapien/client/SapienServerCom';

import BaseGameCtrl from '../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import BaseClientCtrl from '../shared/base-sapien/client/BaseClientCtrl';

import Game from './game/Game';
import Admin from './admin/Admin'
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
        admin: Admin
    };

    component: any;

    dataStore: ApplicationViewModel & ICommonComponentState & {ShowMenu: boolean};

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
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
            ShowMenu: false
        })

        var test = new UserModel();
        test.FirstName = "Billy bob"
        this.dataStore.Users = [
            test
        ]
        //this.ComponentFistma.goTo(this.ComponentFistma.currentState)
        console.log(this.component.props)


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