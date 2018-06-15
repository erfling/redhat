import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";
import FiStMa from '../entity-of-the-state/FiStMa';
import ApplicationViewModel from './ApplicationViewModel'

export default class AdminViewModel extends BaseModel {

    [index: string]: any;

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[];

    Users: UserModel[];

    get CurrentUser(): UserModel {
        return ApplicationViewModel.CurrentUser;
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