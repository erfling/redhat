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

    content: [
        {
            data: any;
            depth: number,
            entityRanges: any[],
            inlineStyleRanges: any[],
            key: string,
            test: string,
            type: string
        }

    ];

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }

}