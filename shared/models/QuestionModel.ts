import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from './PossibleAnswerModel';
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import ResponseModel from "./ResponseModel";

export enum QuestionType {
    PRIORITY = "PRIORITY",
    MULTIPLE_CHOICE ="MULTIPLE_CHOICE",
    SLIDER = "SLIDER"
}


export default class QuestionModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    public Text: string = "";

    @dbProp(String)
    public Type: QuestionType = QuestionType.MULTIPLE_CHOICE;

    @dbProp([ValueObj])
    public PossibleAnswers: ValueObj[] = [];
    public set _PossibleAnswers(answers: ValueObj[]){
        this.PossibleAnswers = answers;
    }
    public AddPossibleAnswer(answer: ValueObj){
        this.PossibleAnswers = this.PossibleAnswers.concat(answer);
    }

    Response: ResponseModel = new ResponseModel();

    //Maker for question this quesitno is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: String = null;

}