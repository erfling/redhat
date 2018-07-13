import { JobName } from './UserModel';

export default interface RoundChangeMapping{
    ParentRound: string;
    ChildRound: string;
    UserJobs?: {[index:string]: JobName}; // object where keys are user's _id as string & values are one of JobName enum values
}