import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import RoundModel from "../models/RoundModel";
import SubRoundModel from "../models/SubRoundModel";



//Encodes various slidedeck positions / state of UI data for any round/subround/show(**) toggles 
// 
export default class RoundChangeLookup extends BaseModel
{

    //Round for the lookup
    @dbProp(String)
    Round?: string = null;

    //Subround
    @dbProp(String)
    SubRound?: string = null;

    //Round for the lookup
    @dbProp(String)
    RoundId?: string = null;

    //Subround
    @dbProp(String)
    SubRoundId?: string = null;
    

    @dbProp(Boolean)
    ShowFeedback: boolean = false;

    @dbProp(Boolean)
    ShowRateUsers: boolean = false;
    
    @dbProp(Boolean)
    ShowIndividualFeedback: boolean = false;

    @dbProp(Number)
    MinSlideNumber?: number = null;

    @dbProp(Number)
    MaxSlideNumber?: number = null;

    @dbProp(Boolean)
    SlideFeedback: boolean = false;

    NumTeams: number;

    RoundScoreIdx: number;

    CumulativeScoreIdx: number;

 }



