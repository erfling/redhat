import ValueObj from "../entity-of-the-state/ValueObj";
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