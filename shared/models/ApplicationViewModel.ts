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

    public static get CurrentUser(): UserModel{
        if(localStorage.getItem("RH_USER")){
            return JSON.parse(localStorage.getItem("RH_USER")) as UserModel;
        }
        return null
    }

    public static get Token(): string{
        if(localStorage.getItem("rhjwt")){
            return localStorage.getItem("RH_USER");
        }
        return null
    }

    TestStringArray: string[] = [];
    TestObjArray: any[] = [];
    TestObjWithArray: {test: any[]} = {test: []};

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }


}