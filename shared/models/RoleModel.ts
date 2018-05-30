import ContentBlock from './ContentBlock'
import PossibleAnswer from "./PossibleAnswerModel";
import QuestionModel from "./QuestionModel";

export interface RoleShape {
    Name: "ADMIN" | "FACILITATOR" | "PLAYER"
}

export default class RoleModel implements RoleShape
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Name: "ADMIN" | "FACILITATOR" | "PLAYER" = null;
        
}