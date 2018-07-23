'use strict';
import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import { Component } from 'react';
import BaseClientCtrl, { IControllerDataStore } from '../shared/base-sapien/client/BaseClientCtrl';
import ToastModel, {IToastProps} from "../shared/base-sapien/models/ToastModel";
import DataStore from '../shared/base-sapien/client/DataStore';
import ComponentsVO from '../shared/base-sapien/client/ComponentsVO';

export default class ApplicationCtrl extends BaseClientCtrl<IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: ApplicationCtrl;

    public readonly ComponentStates = {
        game: ComponentsVO.Game,
        admin: ComponentsVO.Admin,
        login: ComponentsVO.Login
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    
    private constructor(reactComp?: Component<any, any>) {
        super( null, reactComp );
        
        if (reactComp) this._setUpFistma(reactComp);
    }
    
    public static GetInstance(reactComp?: Component<any, any>): ApplicationCtrl {
        if (!this._instance) {
            this._instance = new ApplicationCtrl(reactComp || null);
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
  
    public signOut(): void {
        localStorage.removeItem("RH_USER");
        localStorage.removeItem("rhjwt");
        localStorage.removeItem("RH_TEAM");
        this.dataStore.ApplicationState.CurrentUser = null;
        this.navigateOnClick("/login/admin")
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component): void {
        this.component = reactComp;
        
        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel()

        this.CurrentLocation = this.component.props.location.pathname;
        if (DataStore.ApplicationState.CurrentUser && DataStore.ApplicationState.CurrentUser.Role == RoleName.ADMIN || this.UrlToComponent(this.CurrentLocation) == this.ComponentStates.admin){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.admin);
        } else {
            this.ComponentFistma =  new FiStMa(this.ComponentStates, this.ComponentStates.game);
        }
        
        this.ComponentFistma.addTransition(this.ComponentStates.game);
        this.ComponentFistma.addTransition(this.ComponentStates.admin);
        
        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma
        }
    }

    public addToast(message: string, cssClass?: string, activeDuration?: number, fadeDuration?: number): void {
        const toastProps: IToastProps = {
            Message: message,
            CSSClass: cssClass || null
        }

        if (activeDuration) toastProps.ActiveDuration = activeDuration;
        if (fadeDuration) toastProps.FadeDuration = fadeDuration;

        const toast = new ToastModel(this.dataStore.ApplicationState.Toasts, toastProps)
    }

}