import FiStMa from "../entity-of-the-state/FiStMa";
import BaseModel from "../base-sapien/models/BaseModel";
import { Type } from 'class-transformer';

export interface GameShape {

    Name: string;

    Location: string

    DatePlayed: Date;
}

export default class GameModel extends BaseModel implements GameShape
{
    constructor(){
        super();
    }
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Name: string = "";

    public Location: string = "";

    public DatePlayed: Date;

    @Type(() => FiStMa)
    public RoundsFistma:FiStMa<{[key:string]: any}>;
    
}