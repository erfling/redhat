import { Component } from 'react';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import UserModel from '../../shared/models/UserModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import GameModel from '../../shared/models/GameModel';
import AdminCtrl from './AdminCtrl';
import ApplicationCtrl from '../ApplicationCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';

export default class UserManagementCtrl extends BaseClientCtrl<IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: UserManagementCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp?: Component<any, any>) {
        super(null, reactComp || null);
        this.CurrentLocation = this.component.props.location.pathname;
        
        if (reactComp) this._setUpFistma(reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): UserManagementCtrl {
        if (!this._instance) {
            this._instance = new UserManagementCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");
        if (reactComp) this._instance.component = reactComp;

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

    public getAllGames(){
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "games").then(r => {
            this.dataStore.Admin.Games = r;
            this.dataStore.ApplicationState.IsLoading = false;
        })
    }

    public getAllUsers(){
        if (!this.dataStore.Admin.Users || !this.dataStore.Admin.Users.length){
            return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "user").then(r => {
                this.dataStore.Admin.Users = r;
                this.dataStore.ApplicationState.IsLoading = false;
                return this.dataStore.Admin.Users;
            })
        } else {
            return new Promise((resolve, reject) => {
                return resolve(this.dataStore.Admin.Users);
            })
        }
    }

    public createOrEditUser(user?: UserModel){
        this.dataStore.ApplicationState.ModalObject = Object.assign(new UserModel(), user) || new GameModel();
        this.openModal();
    }
    
    public saveUser(user: UserModel){
        this.dataStore.ApplicationState.FormIsSubmitting = true;
        SapienServerCom.SaveData(user, SapienServerCom.BASE_REST_URL + "user")
                        .then(r => {
                            if (user._id){
                                this.dataStore.Admin.Users = this.dataStore.Admin.Users.map(u => {
                                    return u._id == user._id ? Object.assign(user, r) : u
                                })
                            } else {
                                console.log(r, Object.assign(new UserModel(), r))
                                this.dataStore.Admin.Users = this.dataStore.Admin.Users.concat(Object.assign(new UserModel(), r))
                            }
                            console.log("USERS ARE", AdminCtrl.GetInstance().dataStore.Admin.Users)
                            this.dataStore.ApplicationState.FormIsSubmitting = false;
                            this.closeModal();
                            ApplicationCtrl.GetInstance().addToast("Save successful")

                        })
                        .catch(() => {
                            this.closeModal();
                            ApplicationCtrl.GetInstance().addToast("There was a problem saving the user", "danger");
                        })
    }

    public DeleteUser(user: UserModel){
        return SapienServerCom.DeleteData(user, SapienServerCom.BASE_REST_URL + "user").then(r => {
            this.dataStore.Admin.Users = this.dataStore.Admin.Users.filter(u => u._id != user._id);
            console.log(AdminCtrl.GetInstance().dataStore.Admin.Users, this.dataStore.Admin.Users)
            this.dataStore.Admin.DeletionUser = null; 
        })
    }

    private _setUpFistma(reactComp: Component) {
        this.component = reactComp;

        this.dataStore = {
            ApplicationState: AdminCtrl.GetInstance().dataStore.ApplicationState,
            Admin: AdminCtrl.GetInstance().dataStore.Admin,
            ComponentFistma: AdminCtrl.GetInstance().dataStore.ComponentFistma
        }

    }

}