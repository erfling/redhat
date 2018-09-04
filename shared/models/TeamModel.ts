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

    @dbProp(Number)
    Number: number = 1;

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

    constructor() {
        super();
        this.Name = Array("Amazon", "Orinoco", "Ganges", "Madeira", "Jiang", "Brahmaputra", "Yenisei", "Japurá", "Paraná", "Lena", "Mississippi", "Marañón", "Ganges", "Mekong", "Tocantins", "Tapajos", "Ucayali", "Irrawaddy", "Purus", "Beni")[this.Number];
    }
       
}