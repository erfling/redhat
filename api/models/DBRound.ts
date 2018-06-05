import { prop, arrayProp, Typegoose, ModelType, InstanceType, Ref, instanceMethod } from 'typegoose';
import * as mongoose from 'mongoose';
import { RoundShape } from '../../shared/models/RoundModel'
import ContentBlockModel from '../../shared/models/ContentBlock';
import QuestionModel from '../../shared/models/QuestionModel';

//TODO: find out how to save nested teams, not just their refs. Possibly with pre method: https://github.com/szokodiakos/typegoose#pre
export class DBRound extends Typegoose implements RoundShape
{
    @prop({default: "Round"})
    CLASS_NAME:string;
    
    @prop({default: "rounds"})
    REST_URL:string;

    @prop()
    Name: string;

    @prop()
    Label: string;

    @prop()
    IndividualContributorContent: ContentBlockModel[];

    @prop()
    LeaderContent: ContentBlockModel[];

    @prop()
    Questions: QuestionModel[];

  }

  export const DBRoundModel = new DBRound().getModelForClass( DBRound, { existingMongoose: mongoose } )
  