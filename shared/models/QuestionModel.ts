import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import PossibleAnswer from './PossibleAnswerModel';

export enum QuestionType  {
    "MULTIPLE_CHOICE",
    "SLIDER"
}

export interface QuestionShape {
    Text: string;

    Type: QuestionType;

    PossibleAnswers: PossibleAnswer[];
}

export default class QuestionModel implements QuestionShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Text: string = "";

    public Type: QuestionType = QuestionType.MULTIPLE_CHOICE;

    public PossibleAnswers: PossibleAnswer[] = [];
    public set _PossibleAnswers(answers: PossibleAnswer[]){
        this.PossibleAnswers = answers;
    }

    public AddPossibleAnswer(answer: PossibleAnswer){
        this.PossibleAnswers = this.PossibleAnswers.concat(answer);
    }
    
}