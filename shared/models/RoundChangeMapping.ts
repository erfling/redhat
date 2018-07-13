import { JobName } from './UserModel';

export default interface RoundChangeMapping{
    ParentRound: string;
    ChildRound: string;
    UserJobs: [{[index:string]: JobName}]; // array of objects, where key is user's _id as string & value is one of JobName enum values
}