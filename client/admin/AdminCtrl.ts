'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import { Component } from 'react';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import { RoleName } from '../../shared/models/UserModel';
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

    public readonly ComponentStates = {
        gameList: ComponentsVO.GameList,
        gameDetail: ComponentsVO.GameDetail,
        users: ComponentsVO.UserList,
        adminLogin: ComponentsVO.AdminLogin,
        default: ComponentsVO.DefaultAdmin
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    private constructor(reactComp? : Component<any, any>) {
        super(null, reactComp || null);
       
        if (reactComp) this._setUpFistma(reactComp);
    }
    
    public static GetInstance(reactComp?: Component<any, any>): AdminCtrl {
        if (!this._instance) {
            this._instance = new AdminCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");

        if (reactComp) this._instance._setUpFistma(reactComp);
        
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
 
    private _setUpFistma(reactComp: Component){
        this.component = reactComp;

        this.dataStore = {
            Admin: DataStore.Admin,
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null
        }

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
            //console.log("HEY YOU",this.component.props.location);
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname) || this.ComponentStates.default);
        }

        this.ComponentFistma.addTransition(this.ComponentStates.adminLogin)
        this.ComponentFistma.addTransition(this.ComponentStates.default)
        this.ComponentFistma.addTransition(this.ComponentStates.gameList)
        this.ComponentFistma.addTransition(this.ComponentStates.users)
        this.ComponentFistma.onInvalidTransition(() => {
            
        });

        this.ComponentFistma.addOnEnter("*", () => {
            console.warn("ADMIN ON ENTER", this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME)
            this.component.forceUpdate();
        })

        this.component.componentDidUpdate = (prevProps, prevState, snapshot) => {
            console.log("ADMIN DID UPDATE", this.component.props.location.pathname, prevProps.location.pathname, this.component.props.location.pathname == prevProps.location.pathname)
            this.conditionallyNavigate(this.component.props.location.pathname, prevProps.location.pathname)
        }

        this.dataStore.ComponentFistma = this.ComponentFistma;
    }

}