import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";
import FiStMa from '../entity-of-the-state/FiStMa';

export default class AdminViewModel extends BaseModel{

    [index: string]: any;

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[];

    Users: UserModel[];

    ComponentsFistma: FiStMa<{[key:string]: any}>;;

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