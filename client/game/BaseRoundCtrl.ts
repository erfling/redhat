'use strict';
import BaseController from '../../shared/BaseController';
import RoundModel from '../../shared/models/RoundModel';
import ContentBlock from '../../shared/models/ContentBlock'

export default abstract class BaseRoundCtrl extends BaseController<RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: React.Component<any, any>) {
        super(new RoundModel(), reactComp.forceUpdate.bind(reactComp));
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------
    public updateICContent(contentBlock: ContentBlock, i?: number){
        console.log("RELEVANT CONTROLLER", this)
        if(i != undefined && i < this.dataStore.IndividualContributorContent.length){
            this.dataStore.IndividualContributorContent[i] = contentBlock;
        } else {
            this.dataStore.IndividualContributorContent = this.dataStore.IndividualContributorContent.concat(contentBlock);
        }
    }
    
    public updateLeaderContent(content: ContentBlock[]){
        this.dataStore.LeaderContent = content;
    }


    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    

}