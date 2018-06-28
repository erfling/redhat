import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from "./PossibleAnswerModel";
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
import BaseModel from "../base-sapien/models/BaseModel";

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

    public Answer: ValueObj = new ValueObj();
    
    @Type(() => PossibleAnswer)
    public PossibleAnswer: PossibleAnswer = new PossibleAnswer();

    @Type(() => QuestionModel)
    public Question: QuestionModel = new QuestionModel();
    
}