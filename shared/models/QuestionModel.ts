import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from './PossibleAnswerModel';
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";

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

    public Text: string = "";

    public Type: QuestionType = QuestionType.MULTIPLE_CHOICE;

    @dbProp([PossibleAnswer])
    public PossibleAnswers: PossibleAnswer[] = [];
    public set _PossibleAnswers(answers: PossibleAnswer[]){
        this.PossibleAnswers = answers;
    }

    public AddPossibleAnswer(answer: PossibleAnswer){
        this.PossibleAnswers = this.PossibleAnswers.concat(answer);
    }
    
}