import BaseModel, {dbProp} from "../base-sapien/models/BaseModel";

export default class ContentBlockModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    Header: string;

    @dbProp(String)
    Body: string;
    
    Chart?: any;

    @dbProp(Date)
    Updated?: Date;

    IsNew?: boolean = false;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }

}