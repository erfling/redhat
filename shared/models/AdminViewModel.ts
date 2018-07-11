import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";
import ApplicationViewModel from './ApplicationViewModel'
import ValueObj from "../entity-of-the-state/ValueObj";

export default class AdminViewModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[] = [];

    SelectedGame: GameModel;

    Users: UserModel[] = [];

    private _CurrentUser: UserModel;
    get CurrentUser(): UserModel {
        return ApplicationViewModel.CurrentUser;
    }

    set CurrentUser(user: UserModel) {
        this._CurrentUser = user;
    }

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
        //console.log("Look at Butt:", (<any>this).constructor.name, this.DbSchema);
    }


}