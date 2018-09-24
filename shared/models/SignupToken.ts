import BaseModel, {dbProp} from '../base-sapien/models/BaseModel';

export default class SignupToken extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    public Token: string = "";

    @dbProp(Boolean)
    public IsUsed: boolean;

    @dbProp(String)
    public UserId: string;
    
}