import BaseModel, {dbProp} from "../base-sapien/models/BaseModel";

export interface ContentBlockShape {
    EditMode: boolean;
    Header: string;
    Body: string;
}

export default class ContentBlockModel extends BaseModel
{

    constructor(){
        super();
    }
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(Boolean)
    EditMode: boolean = false;

    Header: string;

    Body: string;
    
    Chart?: any;

    @dbProp(Date)
    Updated?: Date;
    
}