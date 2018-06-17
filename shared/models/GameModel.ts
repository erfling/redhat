import { BaseShape, dbProp } from './../base-sapien/models/BaseModel';
import FiStMa from "../entity-of-the-state/FiStMa";
import BaseModel from "../base-sapien/models/BaseModel";
import TeamModel from "../models/TeamModel";
import { Type } from 'class-transformer';
import { ObjectID } from 'bson';
import UserModel from './UserModel';

export default class GameModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static REST_URL = "games"

    public Name: string = "";

    @dbProp(String)
    public Location: string = "";

    @dbProp(String)
    public DatePlayed: string = new Date().toLocaleDateString();

    @Type(() => TeamModel)
    @dbProp([ObjectID])
    public Teams: TeamModel[];

    @Type(() => FiStMa)
    public RoundsFistma:FiStMa<{[key:string]: any}>;

    @Type(() => UserModel)
    @dbProp([ObjectID])
    public Facilitator: UserModel = new UserModel()

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
        this.REST_URL = "games";
    }
    
}