import ValueObj, {SliderValueObj} from "../entity-of-the-state/ValueObj";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import ResponseModel from "./ResponseModel";

export enum QuestionType {
    PRIORITY = "PRIORITY",
    MULTIPLE_CHOICE ="MULTIPLE_CHOICE",
    TOGGLE ="TOGGLE",
    SLIDER = "SLIDER",
    NUMBER = "NUMBER"
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
    public SubText: string = "";

    @dbProp(String)
    public Type: QuestionType = QuestionType.MULTIPLE_CHOICE;

    @dbProp([SliderValueObj])
    public PossibleAnswers: SliderValueObj[] = [];

    Response: ResponseModel = new ResponseModel();

    //Maker for question this quesitno is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: string = null;

}