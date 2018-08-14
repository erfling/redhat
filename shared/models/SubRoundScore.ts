import BaseModel, {dbProp} from '../base-sapien/models/BaseModel';

export default class SubRoundScore extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    public TeamId: string = "";
    @dbProp(String)
    public RoundId: string="";

    @dbProp(String)
    public SubRoundId: string="";

    @dbProp(String)
    public GameId: string = "";
  
    @dbProp(String)
    public RawScore: string = "";

    @dbProp(String)
    public MaxRawScore: string = "";   
   
   
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }

}