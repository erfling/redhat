'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import { Component } from 'react';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../shared/base-sapien/client/ComponentsVO';

export default class AdminCtrl extends BaseClientCtrl<IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: AdminCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    private constructor(reactComp? : Component<any, any>) {
        super(null, reactComp || null);
    }
    
    public static GetInstance(reactComp?: Component<any, any>): AdminCtrl {
        if (!this._instance) {
            this._instance = new AdminCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp)  this._instance._setUpFistma(reactComp);

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
 
    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        var compStates = {
            gameList: ComponentsVO.GameList,
            gameDetail: ComponentsVO.GameDetail,
            users: ComponentsVO.UserList,
            adminLogin: ComponentsVO.AdminLogin,
            default: ComponentsVO.DefaultAdmin
        };

        //if we don't have a user, go to admin login.
        if (!ApplicationViewModel.CurrentUser || !ApplicationViewModel.Token){
            this.ComponentFistma = new FiStMa(compStates, compStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else {
            this.ComponentFistma = new FiStMa(compStates, compStates.adminLogin);

            //console.log("HEY YOU",this.component.props.location);
        }

        this.ComponentFistma.onInvalidTransition(() => {
            
        });

        this.ComponentFistma.addOnEnter("*", () => {
            console.warn("ADMIN ON ENTER", this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME)
            this.component.forceUpdate();
        })


        this.dataStore = {
            Admin: DataStore.Admin,
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma
        }

        this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.Users.map(u => u);
        this.dataStore.Admin.FilteredGames = this.dataStore.Admin.Games.map(g => g);
    }

    public FilterUsers(prop: string, value: string){
        value = value.toUpperCase();

        this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.FilteredUsers.filter(u => {
            return u[prop].toUpperCase().indexOf(value) != -1;
        })
    }

    
    public FilterGames(prop: string, value: string){
        value = value.toUpperCase();

        this.dataStore.Admin.FilteredGames = this.dataStore.Admin.FilteredGames.filter(g => {
            return g[prop].toUpperCase().indexOf(value) != -1;
        })
    }

}