import BaseModel, {dbProp} from '../base-sapien/models/BaseModel';
import QuestionModel from './QuestionModel';

export default class FacilitationRoundResponseMapping extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //public  REST_URL: string = urlFactory.getBaseUrl(RoundModel); 

    public REST_URL: string = "rounds/subround/message";

    public SubRoundId: string = "";

    public SubRoundLabel: string = "";

    public SubRoundName: string = "";

    public TeamId: string;

    public TeamName: string;

    public Questions: QuestionModel[] = [];

    public RatingQuestions: QuestionModel[] = [];

    public IsComplete: boolean = true;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    
}