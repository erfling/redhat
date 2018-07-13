import UserModel from "./UserModel";
import { Type } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import { ObjectID } from "bson";
import ResponseModel from "./ResponseModel";

export default class TeamModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    Name: string = "";

    @dbProp([ObjectID])
    @Type(() => UserModel)
    public Players: UserModel[] = [];
    
    @dbProp([ResponseModel])
    public Responses: ResponseModel[];

    @dbProp(String)
    GameId: string;

}