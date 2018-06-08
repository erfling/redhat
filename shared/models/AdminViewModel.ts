import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";

export default class AdminViewModel extends BaseModel{

    [index: string]: any;

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[];

    Users: UserModel[];

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