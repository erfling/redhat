import ValueObj from "../entity-of-the-state/ValueObj";
import PossibleAnswer from "./PossibleAnswerModel";
import QuestionModel from "./QuestionModel";
import { Type } from "class-transformer";
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

    @dbProp([{label: String, value: String}])
    private _Answer: ValueObj[] | ValueObj = [new ValueObj()];
    public set Answer(answer: ValueObj[] | ValueObj) {
        this._Answer = answer;
    }
    public get Answer() {
        if(this._Answer && Array.isArray(this._Answer) && this._Answer.length == 1){

            if(!isNaN(parseFloat(this._Answer[0].data))){
                this._Answer[0].data = parseFloat(this._Answer[0].data);
            }
            return this._Answer[0];            
        }

        console.log("HERE'S YOUR ANSWER: ", this, this._Answer)

        return (this._Answer && this._Answer) ? (this._Answer as ValueObj[]).map(a => {
            if(!isNaN(parseFloat(a.data))){
                a.data = parseFloat(a.data);
            }
            return a;
        }) as ValueObj[] : null;
    }
    
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
    
    @Type(() => PossibleAnswer)
    public PossibleAnswer: PossibleAnswer = new PossibleAnswer();

    @Type(() => QuestionModel)
    public Question: QuestionModel = null;

    //Maker for question this response's question is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: String = null;

    
}