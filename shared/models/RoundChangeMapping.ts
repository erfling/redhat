import { JobName } from './UserModel';

export default interface RoundChangeMapping{
    ParentRound: string;
    ChildRound: string;
    UserJobs: [{[index:string]: JobName}];
}