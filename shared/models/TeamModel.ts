import UserModel from "./UserModel";
import { Type } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import { ObjectID } from "bson";


export default class TeamModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp([ObjectID])
    @Type(() => UserModel)
    public Players: UserModel[];

    GameId: string;

}