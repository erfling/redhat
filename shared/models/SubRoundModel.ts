import { BaseShape } from './../base-sapien/models/BaseModel';
import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import { Expose, Type } from "class-transformer";
import "reflect-metadata";
import FiStMa from '../entity-of-the-state/FiStMa';


export default class SubRoundModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //public  REST_URL: string = urlFactory.getBaseUrl(RoundModel); 

    @Type(() =>String)
    @dbProp(String)
    public Name: string = "";

    @dbProp(String)
    public Label: string = "";

    @dbProp(Number)
    public RoundIdx: number = 0;

    @Type(() => ContentBlock)
    @dbProp([ContentBlock])
    public IndividualContributorContent: ContentBlock[] = [];
    
    @Type(() => ContentBlock)
    @dbProp([ContentBlock])
    public LeaderContent: ContentBlock[] = [];

    @Expose()
    get _LeaderContent(): ContentBlock[]{
        return this.LeaderContent;
    }
    set _LeaderContent(content: ContentBlock[]) {
        this.LeaderContent = content;
    }

    public SubRoundsFistma:FiStMa<{[key:string]: any}>;

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