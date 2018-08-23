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
  
    @dbProp(Number)
    public RawScore: number = 0;

    @dbProp(Number)
    public MaxRawScore: number = 0;   
   
    @dbProp(Number)
    public NormalizedScore: number = 0;

    get FullScore(){
        if(this.BonusPoints){
            return this.NormalizedScore + this.BonusPoints;
        }
        return this.NormalizedScore;
    }

    @dbProp(String)
    public RoundLabel: string;

    @dbProp(String)
    public SubRoundLabel: string;

    @dbProp(String)
    public TeamLabel: string;

    @dbProp(Number)
    public BonusPoints: number;

}