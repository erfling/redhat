import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import "reflect-metadata";
import ResponseModel from './ResponseModel';
import MessageModel from './MessageModel'

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