export interface ContentBlockShape {
    EditMode: boolean;
    Header: string;
    Body: string;
}

export default class ContentBlockModel implements ContentBlockShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    EditMode: boolean = false;
    Header: string;
    Body: string;
    Chart?: any;
    
}