import ValueObj from "./ValueObj";
import ContentBlock from './ContentBlock'

export interface PossibleAnswerShape{

    Answer: ValueObj;

}

export default class PossibleAnswer
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Answer: ValueObj = new ValueObj();
    
}