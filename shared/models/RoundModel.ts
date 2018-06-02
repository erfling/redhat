import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import { Expose, Type } from "class-transformer";
import "reflect-metadata";

export interface RoundShape {


    Name: string;

    IndividualContributorContent: ContentBlock[];

    LeaderContent: ContentBlock[];

    Questions: QuestionModel[];

}

export default class RoundModel extends BaseModel implements RoundShape 
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //public  REST_URL: string = urlFactory.getBaseUrl(RoundModel); 

    public Name: string = "";

    public RoundIdx: number = 0;

    @Type(() => ContentBlock)
    public IndividualContributorContent: ContentBlock[] = [];
    
    @Type(() => ContentBlock)
    @dbProp(Array(ContentBlock))
    public LeaderContent: ContentBlock[] = [];

    @Expose()
    get _LeaderContent(): ContentBlock[]{
        return this.LeaderContent;
    }
    set _LeaderContent(content: ContentBlock[]) {
        this.LeaderContent = content;
    }

    @Type(() => QuestionModel)
    public Questions: QuestionModel[] = [];
    
}