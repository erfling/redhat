import { SliderValueObj } from './../entity-of-the-state/ValueObj';
import { ComparisonLabel } from "./QuestionModel";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import MathUtil from '../entity-of-the-state/MathUtil';

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

    @dbProp([{label: String, data: String, minPoints: Number, maxPoints: Number, idealValue: String}])
    public Answer: SliderValueObj[] | SliderValueObj = [new SliderValueObj()];
    
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
        const ans: SliderValueObj[] = this.Answer as SliderValueObj[];
        var maxScore: number = 0;
        var score: number = 0;
        var ratio: number = 0;
        ans.forEach((val) => {
            if (val.maxPoints != undefined && !isNaN(val.maxPoints)) {
                maxScore += val.maxPoints;
            } else console.log("Where the hell is 'maxPoints' for", val);

            if (val.data != undefined) {
                if (!isNaN(parseFloat(val.data))) {
                    // normalizedScore as percent in min/max range

                    let min = val["min"] ? val["min"] : val.minPoints;
                    let max = val["max"] ? val["max"] : val.maxPoints;
                    if (val.idealValue != undefined) {
                        var idealValDiff = Math.abs(parseFloat(val.idealValue) - parseFloat(val.data));
                        ratio = 1 - (idealValDiff - min) / (max - min);
                    } else {
                        ratio = (parseFloat(val.data) - min) / (max - min);
                    }

                    score += MathUtil.rangeClip(val.maxPoints * ratio, val.minPoints, val.maxPoints);
                } else if (val.data === "true" || val.data === true || val.data === "false" || val.data === false) {
                    console.log("WE GOT THIS IDEAL VALUE",val );
                    if (val.idealValue != undefined) {
                        score += (val.data == val.idealValue) ? val.maxPoints : val.minPoints;
                        console.log("SCORE IS, AS OF NOW: ", score, " | MAX SCORE IS: " ,maxScore)
                    }
                } else {
                    console.log("Not sure what type scoring for 'data' that doesn't resolve to number or bool!");
                }
            } else if (val.label != undefined) {
                // I assume we do string-matching against possible answers...

            } else {
                console.log("Neither 'data' nor 'label' exists, so can't score!");
            }
        });

        if (score > maxScore) console.log("Something fugged up! Score", score, "is higher than response's maxScore", maxScore);

        return score;
    }

}