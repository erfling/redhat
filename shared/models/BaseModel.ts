import FiStMa from "../entity-of-the-state/ValueObj";
import { Type, plainToClass } from "class-transformer";
import "reflect-metadata";

enum FullFilledStates {
    "RAW",
    "FULLFILLED"
}

interface BaseShape{
    _id: string;

    REST_URL: string;

    CLASS_NAME: string;
}

export default class BaseModel
{
    [key:string]: any;
    constructor( jsonPackage: BaseModel = null ){
        //this.PropertyFullfiller.addTransition(FullFilledStates.RAW, FullFilledStates.FULLFILLED);
    }

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    _id: string = "";

    REST_URL: string = "";

    CLASS_NAME: string = "";
    
    //PropertyFullfiller: FiStMa<string[]> = new FiStMa(["RAW", "FULLFILLED"], FullFilledStates.RAW);
    
}