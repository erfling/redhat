import BaseModel, { dbProp } from "../base-sapien/models/BaseModel";
import RoundModel from "../models/RoundModel";
import SubRoundModel from "../models/SubRoundModel";



//Encodes various slidedeck positions / state of UI data for any round/subround/show(**) toggles 
// 
export default class RoundChangeLookup extends BaseModel
{

    //Round for the lookup
    @dbProp(RoundModel)
    Round?: RoundModel = null;

    //Subround
    @dbProp(SubRoundModel)
    SubRound?: SubRoundModel = null;

    @dbProp(Boolean)
    ShowFeedBack: Boolean = false;

    @dbProp(Boolean)
    ShowRateUsers: Boolean = false;
    
    @dbProp(Boolean)
    ShowUserRatings: Boolean = false;

    @dbProp(Number)
    MinSlideNumber?: Number = null;

    @dbProp(Number)
    MaxSlideNumber?: Number = null;
 }



