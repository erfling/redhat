import { BaseShape } from './../base-sapien/models/BaseModel';
import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import SubRoundModel from "./SubRoundModel";
import { Type } from "class-transformer";
import "reflect-metadata";

export interface RoundShape extends BaseShape
{
    Name: string;

    IndividualContributorContent: ContentBlock[];

    LeaderContent: ContentBlock[];

    Questions: QuestionModel[];

}

export default class RoundModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    @Type(() =>String)
    @dbProp(String)
    public Name: string = "";

    @dbProp(String)
    public Label: string = "";

    @Type(() => Number)
    @dbProp(Number)
    public RoundIdx: number = 0;

    @dbProp(String)
    public CurrentSubRound: string = "";

    @Type(() => SubRoundModel)
    @dbProp(String)
    public SubRounds: SubRoundModel[] = [];

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
        this.REST_URL = "rounds";
    }
    
}