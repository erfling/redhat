import { BaseShape } from './../base-sapien/models/BaseModel';
import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import { Expose, Type } from "class-transformer";
import "reflect-metadata";
import FiStMa from '../entity-of-the-state/FiStMa';
import ResponseModel from './ResponseModel';

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

    @Type(() => QuestionModel)
    public Questions: QuestionModel[] = [];
   

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