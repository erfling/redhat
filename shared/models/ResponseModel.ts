import { SliderValueObj } from './../entity-of-the-state/ValueObj';
import { ComparisonLabel } from "./QuestionModel";
import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import MathUtil from '../entity-of-the-state/MathUtil';

export interface ResponseFetcher{
    SubRoundId: string;
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

    @dbProp([{label: String, data: Object, minPoints: Number, maxPoints: Number, idealValue: Object, min: Number, max: Number,
        targetObjId: String,
        targetObjClass: String}])
    public Answer: SliderValueObj[] | SliderValueObj = [new SliderValueObj()];
    
    @dbProp(String)
    public QuestionId: string;
    
    @dbProp(String)
    public GameId: string;

    @dbProp(String)
    public TeamId: string;

    @dbProp(Number)
    public TeamNumber: number;

    @dbProp(String)
    public SubRoundId: string;

    @dbProp(String)
    public RoundId: string;

    @dbProp(Number)
    public Score: number = 0;

    //Maker for question this response's question is paired with in another round, if it is paired.
    @dbProp(String)
    public SiblingQuestionId: string = null;

    //questions often rate other teams' performance
    @dbProp(String)
    public targetObjId: string = null;

    //questions often rate other users' performance
    @dbProp(String)
    public targetObjClass: string = null;

    @dbProp(String)
    public ComparisonLabel: ComparisonLabel;

    public SkipScoring: boolean = false;

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
                if (!isNaN(Number(val.data))) {
                    // get min/max
                    var min = (val["min"] ? val["min"] : val.minPoints) + 1;
                    var max = (val["max"] ? val["max"] : val.maxPoints) + 1;
                    var data = Number(val.data) + 1;
                    // normalized ratio of idealValue and data in min/max range
                    if (val.idealValue != undefined && !isNaN(Number(val.idealValue))) {
                        var idealValue = Number(val.idealValue) + 1;
                        ratio = 1 - Math.abs((idealValue - min) / (max - min) - (data - min) / (max - min));
                    } else {
                        ratio = (data - min) / (max - min);
                    }
                    // range-clip awarded points
                    score += MathUtil.rangeClip(val.maxPoints * ratio, val.minPoints, val.maxPoints);
                    console.log("data:", val.data, "idealVal:", val.idealValue, "ratio:", ratio, "maxPoints:", val.maxPoints, "score:", score);
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

        //TODO: SHOULD WE DO RONDING HERE? I AM FOR NOW.
        //return MathUtil.roundTo(score, 2);
        //return Number(score.toFixed(2));
        return score;
    }

}