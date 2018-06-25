import { BaseShape } from './../base-sapien/models/BaseModel';
import BaseModel, {dbProp} from '../../shared/base-sapien/models/BaseModel';
import ValueObj from "../entity-of-the-state/ValueObj";
import ContentBlock from './ContentBlock'
import QuestionModel from "./QuestionModel";
import SubRoundModel from "./SubRoundModel";
import { Expose, Type } from "class-transformer";
import "reflect-metadata";
import FiStMa from '../entity-of-the-state/FiStMa';

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

    public SubRoundsFistma:FiStMa<{[key:string]: any}>;

    @Type(() => SubRoundModel)
    @dbProp(String)
    public SubRounds: SubRoundModel[];

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