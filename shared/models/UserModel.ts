import RoleModel from "./RoleModel";
import { Type } from "class-transformer";

export interface UserShape {
    FirstName: String;
    
    LastName: string;

    Email: string;

    Password: string;

    Role: RoleModel;
}

export default class UserModel implements UserShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public FirstName: String = "";
    
    public LastName: string = "";

    public Email: string = "";

    public Password: string = "";

    @Type(() => RoleModel)
    public Role: RoleModel = new RoleModel();
    
}