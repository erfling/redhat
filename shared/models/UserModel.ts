import RoleModel from "./RoleModel";
import { Type, Expose } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";

export enum RoleName {
    ADMIN = "ADMIN",
    FACILITATOR = "FACILITATOR",
    PLAYER = "PLAYER"
}

export default class UserModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

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
    
}