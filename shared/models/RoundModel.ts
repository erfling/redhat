import ValueObj from "./ValueObj";
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import { Expose, Type } from "class-transformer";

export interface RoundShape {

    Name: string;

    IndividualContributorContent: ContentBlock[];

    LeaderContent: ContentBlock[];

    Questions: QuestionModel[];

}

export default class RoundModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Name: string = "";

    @Type(() => ContentBlock)
    public IndividualContributorContent: ContentBlock[] = [];
    
    @Type(() => ContentBlock)
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