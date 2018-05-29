import UserModel from "./UserModel";
import { Type } from "class-transformer";

export interface TeamShape {
    Players:UserModel[];
    GameId: string;
}

export default class TeamModel implements TeamShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @Type(() => UserModel)
    public Players: UserModel[];

    GameId: string;

}