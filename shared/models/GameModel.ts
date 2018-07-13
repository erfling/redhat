import { dbProp } from './../base-sapien/models/BaseModel';
import BaseModel from "../base-sapien/models/BaseModel";
import TeamModel from "../models/TeamModel";
import { Type } from 'class-transformer';
import UserModel from './UserModel';
import RoundChangeMapping from './RoundChangeMapping';

export default class GameModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static REST_URL = "games"; //TODO: Do we need this? BaseModel already has instance prop of same name.

    public Name: string = "";

    @dbProp(Number)
    public GamePIN: number;

    @dbProp(String)
    public Location: string = "";

    @dbProp({ParentRound: String, ChildRound: String, UserJobs: {} })
    public CurrentRound: RoundChangeMapping = {
        ParentRound: "",
        ChildRound: "",
        UserJobs: null
    };

    @dbProp(String)
    public DatePlayed: string = new Date().toLocaleDateString();

    @Type(() => TeamModel)
    @dbProp(String)
    public Teams: TeamModel[];

    @Type(() => UserModel)
    @dbProp(String)
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