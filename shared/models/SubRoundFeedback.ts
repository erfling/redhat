import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import MessageModel from "./MessageModel";


export enum ValueDemomination {
    POSITIVE = "POSITIVE",
    NEUTRAL = "NEUTRAL",
    NEGATIVE = "NEGATIVE"
}

export default class SubRoundFeedback extends MessageModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @dbProp(String)
    public ValueDemomination: ValueDemomination


}