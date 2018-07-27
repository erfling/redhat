import {SliderValueObj} from "../entity-of-the-state/ValueObj";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import ResponseModel from "./ResponseModel";

export enum QuestionType {
    PRIORITY = "PRIORITY",
    MULTIPLE_CHOICE ="MULTIPLE_CHOICE",
    TOGGLE ="TOGGLE",
    CHECKBOX ="CHECKBOX",
    SLIDER = "SLIDER",
    NUMBER = "NUMBER"
}

export enum ComparisonLabel{
    QUANTITY = "QUANTITY",
    PRICE = "PRICE",
    PRICE_PER_CUSTOMER = "PRICE_PER_CUSTOMER",
    PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",    
    CSAT = "CSAT",    
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

    //Maker for question this quesitno is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: string = null;

    @dbProp(String)
    public RatingMarker: string = null;

    @dbProp(String)
    public ComparisonLabel: ComparisonLabel;

    Response: ResponseModel = Object.assign(new ResponseModel(), {ComparisonLabel: this.ComparisonLabel || null});

}