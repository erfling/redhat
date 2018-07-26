import UserModel from "./UserModel";
import { Type } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import { ObjectID } from "bson";
import ResponseModel from "./ResponseModel";
import RoundChangeMapping from "./RoundChangeMapping";

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

    CurrentRound: Partial<RoundChangeMapping> = {
        ParentRound: "",
        ChildRound: ""
    };
}