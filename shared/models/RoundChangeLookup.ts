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
    ShowFeedback: Boolean = false;

    @dbProp(Boolean)
    ShowRateUsers: Boolean = false;
    
    @dbProp(Boolean)
    ShowIndividualFeedback: Boolean = false;

    @dbProp(Number)
    MinSlideNumber?: Number = null;

    @dbProp(Number)
    MaxSlideNumber?: Number = null;
 }



