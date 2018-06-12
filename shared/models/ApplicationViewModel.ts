import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";
import FiStMa from '../entity-of-the-state/FiStMa';

export default class ApplicationViewModel extends BaseModel{

    [index: string]: any;

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[];

    Users: UserModel[];

    private _CurrentUser: UserModel
    public get CurrentUser(){
        if(localStorage.getItem("RH_USER")){
            return JSON.parse(localStorage.getItem("RH_USER")) as UserModel;
        }
        return null
    }

    ComponentsFistma: FiStMa<{[key:string]: any}>;;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }


}