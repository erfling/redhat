'use strict';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../shared/models/RoundModel';
import Hiring from './Hiring';
import PeopleRound_Sub2 from './PeopleRound_Sub2';
import PeopleRound_Sub3 from './PeopleRound_Sub3';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';

export default class PeopleRoundCtrl extends BaseRoundCtrl<RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    protected readonly ComponentStates = {
        sub1: Hiring,
        sub2: PeopleRound_Sub2
    };
    
    ComponentFistma: FiStMa<any>


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: React.Component<any, any>) {
        super(reactComp);
        this.dataStore.Name = "PEOPLE";
        
        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);

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