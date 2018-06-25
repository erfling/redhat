'use strict';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';

export default class EngineeringRoundCtrl extends BaseRoundCtrl<RoundModel>
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
        this.dataStore.Name = "ENGINEERING";
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}