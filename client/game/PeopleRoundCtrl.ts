'use strict';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../shared/models/RoundModel';
import PeopleRound_Sub1 from './PeopleRound_Sub1';
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
        sub1: PeopleRound_Sub1,
        sub2: PeopleRound_Sub2,
        sub3: PeopleRound_Sub3
    };
    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: React.Component<any, any>) {
        super(reactComp);
        this.dataStore.Name = "PEOPLE";
        
        this.dataStore.SubRoundsFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.dataStore.SubRoundsFistma.addTransition(this.ComponentStates.sub1);

        // Test sub-nav
        setTimeout(() => {
            this.dataStore.SubRoundsFistma.goTo(this.ComponentStates.sub3);
        }, 5000);
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