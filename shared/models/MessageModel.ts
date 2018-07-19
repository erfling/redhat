import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';

export default class MessageModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //public  REST_URL: string = urlFactory.getBaseUrl(RoundModel); 

    public REST_URL: string = "rounds/subround/message";


    @dbProp(String)
    public RoundId: string = "";

    @dbProp(String)
    public Title: string = "";

    @dbProp(String)
    public Content: string = "";

    @dbProp(Boolean)
    public IsDefault: boolean = false;

    public IsRead: boolean = false;
    


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    
}