import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";

export default class ApplicationViewModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[] = [];

    Users: UserModel[] = [];

    public static get CurrentUser(): UserModel{
        if (localStorage.getItem("RH_USER")) {
            return JSON.parse(localStorage.getItem("RH_USER")) as UserModel;
        }
        return null
    }

    public static get Token(): string{
        if (localStorage.getItem("rhjwt")) {
            return localStorage.getItem("RH_USER");
        }
        return null
    }

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }

}