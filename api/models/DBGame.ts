import { prop, arrayProp, Typegoose, ModelType, InstanceType, Ref, instanceMethod } from 'typegoose';
import * as mongoose from 'mongoose';
import {GameShape} from '../../shared/models/GameModel'

//TODO: find out how to save nested teams, not just their refs. Possibly with pre method: https://github.com/szokodiakos/typegoose#pre
export class DBGame extends Typegoose implements GameShape
{
    @prop({default: "Game"})
    CLASS_NAME:string;
    
    @prop({default: "games"})
    REST_URL:string;

    @prop()
    Location: string;

    @prop()
    Slug: string;

    @prop()
    Name: string;
/*
    @arrayProp({ itemsRef: Team })
    Teams:  Ref<ITeam>[] | ITeam[];

    @prop()
    TeamRatings?: Ratings | IRatings;
*/
    @prop({default: 1})
    State: string;

    @prop()
    DatePlayed: Date;

    @prop({default: false})
    IsCurrentGame: boolean;

    @prop()
    SubmissionsByRound: string[][];


  }

  export const DBGameModel = new DBGame().getModelForClass( DBGame, { existingMongoose: mongoose } )
  