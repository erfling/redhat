'use strict';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../shared/models/RoundModel';

export default class PeopleRoundCtrl extends BaseRoundCtrl<RoundModel>
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
        super(reactComp);
        this.dataStore.Name = "PEOPLE";
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------
    updateContent(newContent:any){
        super.updateICContent(newContent, 0)
    }


    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}