'use strict';
import BaseController from '../../shared/BaseController';
import RoundModel from '../../shared/models/RoundModel';

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



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}