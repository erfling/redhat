import { SliderValueObj } from "../entity-of-the-state/ValueObj";

export interface IIndividualScoreShape {
    CurrentSubRoundScore: SliderValueObj[];
    CurrentRoundScore: SliderValueObj[];
    GameScore: SliderValueObj;
}
export interface ITeamsScoreShape{
    CurrentSubRoundScore: SliderValueObj[][];
    CurrentRoundScore: SliderValueObj[][];
    GameScore: SliderValueObj[];
}




export default class ScoreHolder{

    //for each team in the game, an array of ValueObjs for feedback on the current round
    TeamsFeedBack: ITeamsScoreShape;
    IndividualFeedBack: IIndividualScoreShape;
    TotalRoundScore: number;
    TotalSubroundScore: number;
    TotalGameScore: number;

}