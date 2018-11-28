import { Type, Expose } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import MessageModel from "./MessageModel";

export enum RoleName {
    ADMIN = "ADMIN",
    FACILITATOR = "FACILITATOR",
    PLAYER = "PLAYER"
}

export enum JobName {
    IC = "Associate",
    MANAGER = "Manager",
    CHIPCO = "Intel",
    INTEGRATED_SYSTEMS = "IBM",
    BLUE_KITE = "Attorney for BlueKite"
}

export default class UserModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    REST_URL: string = "users";

    @dbProp(String)
    @Type(() =>String)
    public FirstName: string;
    
    @dbProp(String)
    @Type(() =>String)
    public LastName: string;

    @Type(() =>String)
    private _Name: string;
    @Expose()
    public get Name(){
        return this.FirstName + " " + this.LastName;
    }

    @dbProp(String)
    @Type(() =>String)
    public Email: string;

    @dbProp(String)
    @Type(() =>String)
    public Password: string;

    @dbProp(String)
    @Type(() => String)
    public Role: RoleName = RoleName.PLAYER;

    @dbProp(Boolean)
    @Type(() => Boolean)
    public IsLeader: boolean = false;

    //Flag to indicate whether a user's role has changed. If role changes to admin, we flag so user is emailed
    public RoleChanged: boolean = false;

    @dbProp(String)
    @Type(() => String)
    public Job: JobName = JobName.IC;

    @dbProp(MessageModel)
    public ReceivedMessages: MessageModel[];
    
    @dbProp([String])
    public ReadMessages: string[] = [];

    @dbProp(String)
    public PasswordRequestDate: string;


}