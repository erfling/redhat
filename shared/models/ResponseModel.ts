import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from "./PossibleAnswerModel";
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";

export interface ResponseFetcher{
    RoundId: string;
    TeamId: string;
    GameId: string;
}

export default class ResponseModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------


    public Answer: ValueObj | ValueObj[]= new ValueObj();
    
    @dbProp(String)
    public QuestionId: string;
    
    @dbProp(String)
    public GameId: string;

    @dbProp(String)
    public TeamId: string;

    @dbProp(String)
    public RoundId: string;
    
    @Type(() => PossibleAnswer)
    public PossibleAnswer: PossibleAnswer = new PossibleAnswer();

    @Type(() => QuestionModel)
    public Question: QuestionModel = new QuestionModel();
    
}