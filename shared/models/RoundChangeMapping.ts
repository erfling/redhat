import { JobName } from './UserModel';
import { dbProp } from '../base-sapien/models/BaseModel';
import BaseModel from '../base-sapien/models/BaseModel';
import { SliderValueObj } from '../entity-of-the-state/ValueObj';

export default class RoundChangeMapping extends BaseModel {
    @dbProp(String)
    GameId: string = "";

    @dbProp(String)
    RoundId: string = "";

    @dbProp(String)
    ParentRound: string = "";

    @dbProp(String)
    ChildRound: string = "";

    @dbProp({})
    UserJobs?: {[index:string]: JobName}; // object where keys are user's _id as string & values are one of JobName enum values

    @dbProp(Boolean)
    ShowRateUsers?: boolean = false; // object where keys are user's _id as string & values are one of JobName enum values

    @dbProp(Boolean)
    ShowFeedback?: boolean = false; // object where keys are user's _id as string & values are one of JobName enum values

    @dbProp(Boolean)
    ShowIndividualFeedback?: boolean = false;

    @dbProp(Number)
    SlideNumber?: number = 1;

    ShowTeams: boolean = false;

    ShowPin: boolean = false;

    SlideFeedback: boolean = false;

    Video: string = null;

    @dbProp({label: String, data: String, minPoints: Number, maxPoints: Number, idealValue: String, min: Number, max: Number, targetObjId: String})
    CurrentHighestBid?: SliderValueObj;

    SkipRoundScore: boolean = false;

}