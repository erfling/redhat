import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from "./PossibleAnswerModel";
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";

export interface ResponseShape {
    Answer: ValueObj;
    
    PossibleAnswer: PossibleAnswer;

    Question: QuestionModel;
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
    
    @Type(() => PossibleAnswer)
    public PossibleAnswer: PossibleAnswer = new PossibleAnswer();

    @Type(() => QuestionModel)
    public Question: QuestionModel = new QuestionModel();
    
}