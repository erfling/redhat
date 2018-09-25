import { Component } from 'react';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import UserModel, { RoleName, JobName } from '../../shared/models/UserModel';
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
    }

    public static GetInstance(reactComp?: Component<any, any>): UserManagementCtrl {
        if (!this._instance) {
            this._instance = new UserManagementCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

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
                this.dataStore.Admin.FilteredUsers = r;

                this.dataStore.Admin.AdminUsers = r.filter(u => u.Role == RoleName.ADMIN)
                this.dataStore.Admin.PlayerUsers = r.filter(u => u.Role == RoleName.PLAYER)
                this.dataStore.Admin.FacilitatorUsers = r.filter(u => u.Role == RoleName.FACILITATOR)

                this.dataStore.ApplicationState.IsLoading = false;
                return this.dataStore.Admin.Users;
            })
        } else {
            return new Promise((resolve, reject) => {
                this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.Users.map(u => u);
                this.dataStore.Admin.AdminUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.ADMIN)
                this.dataStore.Admin.PlayerUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.PLAYER)
                this.dataStore.Admin.FacilitatorUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.FACILITATOR)
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
                            this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.Users.map(u => u);
                            this.dataStore.Admin.AdminUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.ADMIN)
                            this.dataStore.Admin.PlayerUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.PLAYER)
                            this.dataStore.Admin.FacilitatorUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.FACILITATOR)
                            this.closeModal();
                            ApplicationCtrl.GetInstance().addToast("Save successful")

                        })
                        .catch((r) => {
                            this.closeModal();
                            console.log(r)
                            if(r == "DUPLICATE_EMAIL") {
                                ApplicationCtrl.GetInstance().addToast("There is already a user with the email " + user.Email, "danger");
                            } else ApplicationCtrl.GetInstance().addToast("There was a problem saving the user", "danger");
                        })
    }

    public DeleteUser(user: UserModel){
        return SapienServerCom.DeleteData(user, SapienServerCom.BASE_REST_URL + "user").then(r => {
            this.dataStore.Admin.Users = this.dataStore.Admin.Users.filter(u => u._id != user._id);
            this.dataStore.Admin.AdminUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.ADMIN &&  u._id != user._id)
            this.dataStore.Admin.PlayerUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.PLAYER &&  u._id != user._id)
            this.dataStore.Admin.FacilitatorUsers = this.dataStore.Admin.Users.filter(u => u.Role == RoleName.FACILITATOR &&  u._id != user._id)
            console.log(AdminCtrl.GetInstance().dataStore.Admin.Users, this.dataStore.Admin.Users, this.dataStore.Admin.AdminUsers)
            this.dataStore.Admin.DeletionUser = null; 
            ApplicationCtrl.GetInstance().addToast("The user was successfully removed")

        }).catch(() => {
            ApplicationCtrl.GetInstance().addToast("The user could not be deleted","danger red")
        })
    }

    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;

        this.dataStore = {
            ApplicationState: AdminCtrl.GetInstance().dataStore.ApplicationState,
            Admin: AdminCtrl.GetInstance().dataStore.Admin,
            ComponentFistma: AdminCtrl.GetInstance().dataStore.ComponentFistma
        }

        this.dataStore.Admin.FilteredUsers = this.dataStore.Admin.Users.map(u => u);

    }

    public FilterUsers(prop: string, value: string, targetRole: RoleName = RoleName.PLAYER) {
        value = value.toUpperCase();

        let filterObj;
        if (targetRole == RoleName.ADMIN) {
            filterObj = this.dataStore.Admin.AdminFilter;
        } 
        else if (targetRole == RoleName.FACILITATOR) {
            filterObj = this.dataStore.Admin.FacilitatorFilter;
        }
        else {
            filterObj = this.dataStore.Admin.PlayerFilter;
        }

        filterObj[prop] = value;

        let targetList = this.dataStore.Admin.Users.filter(u => {
            let match = true;
            for (let p in filterObj) {

                //if(!filterObj[prop] || !filterObj[prop]) match = true

                if (u.Role != targetRole
                    || !u[prop] 
                    || u[prop].toUpperCase().indexOf(filterObj[prop]) == -1) {
                    match = false;
                }
            }
            return match;
            
        })

        if (targetRole == RoleName.ADMIN) {
            this.dataStore.Admin.AdminUsers = targetList;
        } 
        else if (targetRole == RoleName.FACILITATOR) {
            this.dataStore.Admin.FacilitatorUsers = targetList;
        }
        else {
            this.dataStore.Admin.PlayerUsers = targetList;
        }

    }

}