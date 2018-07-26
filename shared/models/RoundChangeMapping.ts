import { JobName } from './UserModel';
import { dbProp } from './../base-sapien/models/BaseModel';
import BaseModel from '../base-sapien/models/BaseModel';

export default class RoundChangeMapping extends BaseModel {
    @dbProp(String)
    GameId: string = "";

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
}