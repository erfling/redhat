'use strict';
import { IControllerDataStore } from './../../shared/base-sapien/client/BaseClientCtrl';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import UserModel from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import { Component } from 'react';
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import ApplicationCtrl from '../ApplicationCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../shared/base-sapien/client/ComponentsVO';

export default class LoginCtrl extends BaseClientCtrl<IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: LoginCtrl;
    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: Component<any, any>) {
        super( null, reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): LoginCtrl {
        if (!this._instance) {
            this._instance = new LoginCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

        return this._instance;
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public AttemptFirstLogin() {
        SapienServerCom.GetData(null, UserModel, SapienServerCom.BASE_REST_URL + "user/startfirstlogin").then(user => {
            console.log("returned", user)
            Object.assign(this.dataStore.ApplicationState.CurrentUser, user)
        })
    }

    public _onChangeValidateFirstLoginForm(): void{
        console.log((this.component.refs as any).PASSWORD_1.value , (this.component.refs as any).PASSWORD_2.value)
        this.dataStore.ApplicationState.FormIsValid = (this.component.refs as any).PASSWORD_1.value == (this.component.refs as any).PASSWORD_2.value 
                                    &&  /[A-Z]/.test((this.component.refs as any).PASSWORD_1.value) 
                                    && (this.component.refs as any).PASSWORD_1.value.length > 7
    }

    public submitNewUserPassword(){
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        SapienServerCom.SaveData({Password: (this.component.refs as any).PASSWORD_1.value}, SapienServerCom.BASE_REST_URL + "user/usersetpassword").then((returned:any) => {
            console.log("returned", returned)
            Object.assign(this.dataStore.ApplicationState.CurrentUser, returned.user, returned.token);
            localStorage.setItem("rhjwt", returned.token);
            localStorage.setItem("RH_USER", JSON.stringify(returned.user))
            localStorage.setItem("RH_TEAM", JSON.stringify(returned.team))
            this.dataStore.ApplicationState.FormIsSubmitting = false;

            this.component.props.history.push('/admin/userlist')
            //TODO: this shouldn't have to be called. Application controller has a component fistma, which is bound to it's dataStore. navigateOnClick call Should send user to Amin, but it doesn't
            ApplicationCtrl.GetInstance().dataStoreChange();
        })
        .catch((message) => {
            this.dataStore.ApplicationState.FormIsSubmitting = false;
            this.dataStore.ApplicationState.FormError = "";
            console.warn(message)
        })
    }

    public AdminLogin(){
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        SapienServerCom.SaveData({Email: this.dataStore.ApplicationState.CurrentUser.Email, Password: this.dataStore.ApplicationState.CurrentUser.Password}, SapienServerCom.BASE_REST_URL + "auth/admin").then((returned:any) => {
            Object.assign(this.dataStore.ApplicationState.CurrentUser, returned.user);
            localStorage.setItem("rhjwt", returned.token);
            localStorage.setItem("RH_USER", JSON.stringify(returned.user))
            localStorage.setItem("RH_TEAM", JSON.stringify(returned.team))
            this.dataStore.ApplicationState.FormIsSubmitting = false;
            this.component.props.history.push('/admin/userlist')
        })
        .catch((message) => {
            this.dataStore.ApplicationState.FormIsSubmitting = false;
            this.dataStore.ApplicationState.FormError = "There was a problem with your email or password.";
            console.warn(message)
        })
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        var compStates = {
            admin: ComponentsVO.AdminLogin,
            first: ComponentsVO.Join
        };

        this.ComponentFistma = new FiStMa(compStates, compStates.admin);
        this.ComponentFistma.addTransition(compStates.admin);
        this.ComponentFistma.addTransition(compStates.first);

        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma
        };
    }

}