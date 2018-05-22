import FiStMa from "../FiStMa";

export interface GameShape {

    Name: string;

    Location: string

    DatePlayed: Date;
}

export default class GameModel implements GameShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Name: string = "";

    public Location: string = "";

    public DatePlayed: Date;

    public RoundsFistma:FiStMa<{[key:string]: any}>;
    
}