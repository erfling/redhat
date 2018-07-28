import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import "reflect-metadata";
import ResponseModel from './ResponseModel';
import MessageModel from './MessageModel'
import { SliderValueObj } from '../entity-of-the-state/ValueObj';
import GameModel from './GameModel';

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

    @dbProp(String)
    public Label: string = "";

    @dbProp(Number)
    public RoundIdx: number = 0;

    @dbProp(String)
    public IndividualContributorContent: string = "";
    
    @dbProp(String)
    public LeaderContent: string = "";

    @dbProp(MessageModel)
    public LeaderMessages: MessageModel[];

    @dbProp(MessageModel)
    public ICMessages: MessageModel[];

    @dbProp(MessageModel)
    public ChipCoMessages: MessageModel[];

    @dbProp(MessageModel)
    public IntegratedSystemsMessages: MessageModel[];

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