import BaseModel, {dbProp} from '../base-sapien/models/BaseModel';
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import "reflect-metadata";
import ResponseModel from './ResponseModel';
import MessageModel from './MessageModel'
import { SliderValueObj } from '../entity-of-the-state/ValueObj';
import SubRoundFeedback, { ValueDemomination } from './SubRoundFeedback';

export interface ContentShape{
    data: any,
    depth: number,
    entityRanges: any[],
    inlineStyleRanges: any[],
    key: string,
    test: string,
    type: string
}


export default class SubRoundModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //public  REST_URL: string = urlFactory.getBaseUrl(RoundModel); 

    public REST_URL: string = "rounds/subround";


    @Type(() =>String)
    @dbProp(String)
    public RoundId: string = "";

    @Type(() =>String)
    @dbProp(String)
    public Name: string = "";

    /** 
     * Text Description of Subround
     */
    @dbProp(String)
    public Description: string = "";

    @dbProp(String)
    public Label: string = "";

    @dbProp(Number)
    public RoundIdx: number = 0;

    @dbProp(MessageModel)
    public LeaderMessages: MessageModel[] = [];

    @dbProp(MessageModel)
    public ICMessages: MessageModel[] = [];

    @dbProp(MessageModel)
    public ChipCoMessages: MessageModel[] = [];

    @dbProp(MessageModel)
    public IntegratedSystemsMessages: MessageModel[] = [];

    @dbProp(MessageModel)
    public BlueKiteMessages: MessageModel[] = [];

    public DisplayMessages: MessageModel[] = [];

    @dbProp([SubRoundFeedback])
    private _FeedBack: SubRoundFeedback[] = [];
    get FeedBack(){
        //all rounds have the potential to have three types of feedback
        if(this._FeedBack.every(fb => fb.ValueDemomination != ValueDemomination.NEUTRAL)) this._FeedBack.push(Object.assign(new SubRoundFeedback(), {ValueDemomination: ValueDemomination.NEUTRAL}));
        if(this._FeedBack.every(fb => fb.ValueDemomination != ValueDemomination.NEGATIVE)) this._FeedBack.push(Object.assign(new SubRoundFeedback(), {ValueDemomination: ValueDemomination.NEGATIVE}));
        if(this._FeedBack.every(fb => fb.ValueDemomination != ValueDemomination.POSITIVE)) this._FeedBack.push(Object.assign(new SubRoundFeedback(), {ValueDemomination: ValueDemomination.POSITIVE}));

        return this._FeedBack;
    }
    set FeedBack(feedBack: SubRoundFeedback[]){
        this._FeedBack = feedBack;
    }


    @Type(() => QuestionModel)
    public Questions: QuestionModel[] = [];
    

    public Responses: ResponseModel[] = [];
    
    private _Score: number;
    public get Score(){

        this._Score = this.Responses.reduce((prev, curr) => {
            return prev + curr.Score;
        }, 0);

        return this._Score;
    }

    public set Score(score: number){
        this._Score = score;
    }

    @dbProp(String)
    public PrevSubRound: string | SubRoundModel;

    @dbProp(String)
    public NextSubRound: string | SubRoundModel;

    @dbProp(String)
    public ScoreLabel: string = "";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
        this.REST_URL = "rounds";
    }
    
}