import ValueObj from "../entity-of-the-state/ValueObj";
import { ComparisonLabel } from "./QuestionModel";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";

export interface ResponseFetcher{
    RoundId: string;
    TeamId: string;
    GameId: string;
}

export default class ResponseModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp([{label: String, data: String}])
    public Answer: ValueObj[] | ValueObj = [new ValueObj()];
    
    @dbProp(String)
    public QuestionId: string;
    
    @dbProp(String)
    public GameId: string;

    @dbProp(String)
    public TeamId: string;

    @dbProp(String)
    public RoundId: string;

    @dbProp(Number)
    public Score: number = 0;

    //Maker for question this response's question is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: string = null;

    @dbProp(String)
    public ComparisonLabel: ComparisonLabel;
}