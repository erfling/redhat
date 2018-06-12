import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import ApplicationViewModel from '../shared/models/ApplicationViewModel'
import SapienServerCom from '../shared/base-sapien/client/SapienServerCom';

import BaseGameCtrl from '../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import BaseClientCtrl from '../shared/base-sapien/client/BaseClientCtrl';

import Game from './game/Game';
import Admin from './admin/Admin'

export default class ApplicationCtrl extends BaseClientCtrl<ApplicationViewModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private readonly ComponentStates = {
        game: Game,
        admin: Admin
    };

    component: any;

    private CurrentLocation: string;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( new ApplicationViewModel(), reactComp );
        this.component = reactComp;

        console.log(this.component.props);
        this.CurrentLocation = this.component.props.location.pathname;


        //default to game as current state, unless user is logged in and is an admin
        if(this.dataStore.CurrentUser && this.dataStore.CurrentUser.Role == RoleName.ADMIN || this.UrlToComponent(this.CurrentLocation) == this.ComponentStates.admin){
            var ComponentsFistma = this.dataStore.ComponentsFistma = new FiStMa(this.ComponentStates, this.ComponentStates.admin);
        } else {
            var ComponentsFistma = this.dataStore.ComponentsFistma = new FiStMa(this.ComponentStates, this.ComponentStates.game);
        }


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

    UrlToComponent(url: string): any {
        console.log("LOOKIN TO PARSE US SOME URLS: ",url)
        for (var prop in this.ComponentStates){
            console.log(prop, (this.ComponentStates as any)[prop].WrappedComponent.name);
            if( url.toUpperCase().indexOf('/' + (this.ComponentStates as any)[prop].WrappedComponent.name.toUpperCase() + '/') != -1 ) {
                console.log("FOUND A MATCH FOR " + (this.ComponentStates as any)[prop].WrappedComponent.name);
                return (this.ComponentStates as any)[prop];
            }
        }

        return null;
    }


}