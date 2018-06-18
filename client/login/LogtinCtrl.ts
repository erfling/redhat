import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import UserModel from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';

import BaseGameCtrl from '../../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import BaseController from '../../shared/entity-of-the-state/BaseController';
import BaseModel from '../../shared/base-sapien/models/BaseModel';

export default class LoginController extends BaseController<UserModel & {FormIsValid: boolean, FormIsSubmitting: boolean, FormError:string;}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private readonly rounds = {
        
    };

    component: any;

    public FormIsValid: boolean = false;

    public FormIsSubmitting: boolean = false;

    public FormError: string = "";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( Object.assign(new UserModel(), {FormIsValid: false, FormIsSubmitting: false, FormError: null}), reactComp.forceUpdate.bind(reactComp) );
        this.component = reactComp;
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public AttemptFirstLogin() {
        SapienServerCom.GetData(null, UserModel, SapienServerCom.BASE_REST_URL + "user/startfirstlogin").then(user => {
            console.log("returned", user)
            Object.assign(this.dataStore, user)
        })
    }

    public _onChangeValidateFirstLoginForm(): void{
        console.log((this.component.refs as any).PASSWORD_1.value , (this.component.refs as any).PASSWORD_2.value)
        this.dataStore.FormIsValid = (this.component.refs as any).PASSWORD_1.value == (this.component.refs as any).PASSWORD_2.value 
                                    &&  /[A-Z]/.test((this.component.refs as any).PASSWORD_1.value) 
                                    && (this.component.refs as any).PASSWORD_1.value.length > 7
    }

    public submitNewUserPassword(){
        this.dataStore.FormIsSubmitting = true;
        SapienServerCom.SaveData({Password: (this.component.refs as any).PASSWORD_1.value}, SapienServerCom.BASE_REST_URL + "user/usersetpassword").then((returned:any) => {
            console.log("returned", returned)
            Object.assign(this.dataStore, returned.user, returned.token);
            localStorage.setItem("rhjwt", returned.token);
            this.dataStore.FormIsSubmitting = false;
            this.component.props.history.push("/admin");
        })
        .catch((message) => {
            this.dataStore.FormIsSubmitting = false;
            this.dataStore.FormError = "";
            console.warn(message)
        })
    }

    public Login(){
        this.dataStore.FormIsSubmitting = true;
        SapienServerCom.SaveData(this.dataStore, SapienServerCom.BASE_REST_URL + "auth").then((returned:any) => {
            console.log("returned", returned)
            Object.assign(this.dataStore, returned.user, returned.token);
            localStorage.setItem("rhjwt", returned.token);
            localStorage.setItem("RH_USER", JSON.stringify(returned.user))
            this.dataStore.FormIsSubmitting = false;
            window.location.href = 'http://planetsapientestsite.com/admin/userlist';
        })
        .catch((message) => {
            this.dataStore.FormIsSubmitting = false;
            this.dataStore.FormError = "There was a problem with your email or password.";
            console.warn(message)
        })
    }



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}