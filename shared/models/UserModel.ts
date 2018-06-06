import RoleModel from "./RoleModel";
import { Type } from "class-transformer";
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
    public FirstName: String = "";
    
    @dbProp(String)
    public LastName: string = "";

    public Name: string = "";
    public get _Name(){
        return this.FirstName + " " + this.LastName;
    }

    @dbProp(String)
    public Email: string = "";

    @dbProp(String)
    public Password: string = "";

    public Role: RoleName = RoleName.PLAYER;
    
}