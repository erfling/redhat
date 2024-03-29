'use strict';
import FiStMa from '../shared/entity-of-the-state/FiStMa';
import UserModel, { RoleName } from '../shared/models/UserModel';
import { Component } from 'react';
import BaseClientCtrl, { IControllerDataStore } from '../shared/base-sapien/client/BaseClientCtrl';
import ToastModel, {IToastProps} from "../shared/base-sapien/models/ToastModel";
import DataStore from '../shared/base-sapien/client/DataStore';
import ComponentsVO from '../shared/base-sapien/client/ComponentsVO';
import GameCtrl from './game/GameCtrl';
import TeamModel from '../shared/models/TeamModel';
import SapienServerCom from '../shared/base-sapien/client/SapienServerCom';
import GameModel from '../shared/models/GameModel';

export default class ApplicationCtrl extends BaseClientCtrl<IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: ApplicationCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    
    private constructor(reactComp?: Component<any, any>) {
        super( null, reactComp );
    }
    
    public static GetInstance(reactComp?: Component<any, any>): ApplicationCtrl {
        if (!this._instance) {
            this._instance = new ApplicationCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

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

        console.log(DataStore.ApplicationState.CurrentUser)
        let isAdmin = this.dataStore.ApplicationState.CurrentUser.Role == RoleName.ADMIN || DataStore.ApplicationState.CurrentUser.Role == RoleName.ADMIN;
        console.log(isAdmin)

        this.dataStore.ApplicationState = null;
        DataStore.ApplicationState = null;

        if (isAdmin) { 
            //this.component.props.history.push("/login/admin")
            location.pathname = "/login/admin"
        } else {
            GameCtrl.GetInstance().dataStore.ApplicationState = null
            location.pathname = "/game"
            //this.component.props.history.push("/game")
        }
    }

    public EditContent(){
        return SapienServerCom.GetData(null, TeamModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/edit/game").then((t: TeamModel) => {
            localStorage.setItem("RH_TEAM", JSON.stringify(t))
            this.component.props.history.push("/game/peopleround/priorities");
            GameCtrl.GetInstance().getCurrentMapping();
            GameCtrl.GetInstance().dataStoreChange();
            //ApplicationCtrl.GetInstance().addToast("You are now playing the role of " + r.user.Job, "info");
        })
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component): void {
        this.component = reactComp;
        var compStates = {
            game: ComponentsVO.Game,
            admin: ComponentsVO.Admin,
            login: ComponentsVO.Login
        };
        
        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel()
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel()
       
        
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