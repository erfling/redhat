import { SliderValueObj } from "../entity-of-the-state/ValueObj";
import ResponseModel from "./ResponseModel";
import SubRoundFeedback from "./SubRoundFeedback";

export interface IIndividualScoreShape {
    CurrentSubRoundScore: SliderValueObj[];
    CurrentRoundScore: SliderValueObj[];
    GameScore: SliderValueObj;
}


export default class ScoreHolder{

    //for each team in the game, an array of ValueObjs for feedback on the current round
    TeamsFeedBack: SubRoundFeedback[] = []
    IndividualFeedBack: ResponseModel[];
    TotalRoundScore: number;
    TotalSubroundScore: number;
    TotalGameScore: number;
    TargetModel: string;
    TargetObjectId: string;
    Label: string;

}