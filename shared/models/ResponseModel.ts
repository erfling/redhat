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


    public resolveScore(): number {
        const ans: ValueObj[] = this.Answer as ValueObj[];
        var maxScore: number = 0;
        var score: number = 0;

        ans.forEach((val) => {
            if (val.maxPoints != null && !isNaN(parseFloat(val.data))) {
                maxScore += val.maxPoints;
            } else console.log("Where the hell is 'maxPoints' for", val);

            if (val.data != null) {
                if (!isNaN(parseFloat(val.data))) {
                    // normalizedScore as percent in min/max range
                    let min = val["min"] ? val["min"] : val.minPoints;
                    let max = val["max"] ? val["max"] : val.maxPoints;
                    var ratio = (parseFloat(val.data) - min) / (max - min);
                    score += val.maxPoints * ratio;
                } else if (val.data === "true" || val.data === true || val.data === "false" || val.data === false) {
                    if (val.idealValue != null) {
                        score += (val.data == val.idealValue) ? val.maxPoints : val.minPoints;
                    }
                } else {
                    console.log("Not sure what type scoring for 'data' that doesn't resolve to number or bool!");
                }
            } else if (val.label != null) {
                // I assume we do string-matching against possible answers...

            } else {
                console.log("Neither 'data' nor 'label' exists, so can't score!");
            }
        });

        if (score > maxScore) console.log("Something fugged up! Score", score, "is higher than response's maxScore", maxScore);

        return score;
    }

}