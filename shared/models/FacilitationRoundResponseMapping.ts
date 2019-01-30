import BaseModel, {dbProp} from '../base-sapien/models/BaseModel';
import QuestionModel from './QuestionModel';
import UserModel from './UserModel';
import ResponseModel from './ResponseModel';
import { Dictionary } from 'lodash';
import TeamModel from './TeamModel';
import RoundChangeMapping from './RoundChangeMapping';


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

    public GameId: string = '';

    public TeamId: string;

    public TeamName: string;

    public Questions: QuestionModel[] = [];

    public RatingQuestions: QuestionModel[] = [];

    public IsComplete: boolean = true;

    public RatingsOfManager: (ResponseModel & {IsComplete?: boolean})[] = [];
    
    public RatingsByManager: (ResponseModel & {IsComplete?: boolean})[] = [];

    public Members: Array<UserModel> = [];

    public CurrentRound: RoundChangeMapping = null;



    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------
    
}