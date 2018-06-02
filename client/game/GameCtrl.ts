import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import PeopleRound from './PeopleRound';
import EngineeringRound from './EngineeringRound';
import SalesRound from './SalesRound';
import FinanceRound from './FinanceRound';
import CustomerRound from './CustomerRound';
import BaseGameCtrl from '../../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../../api/SchemaBuilder';

export default class GameCtrl extends BaseGameCtrl<GameModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private readonly rounds = {
        round1: PeopleRound, 
        round2: EngineeringRound, 
        round3: SalesRound, 
        round4: FinanceRound, 
        round5: CustomerRound
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( reactComp );
        var rndsFistma = this.dataStore.RoundsFistma = new FiStMa(this.rounds, this.rounds.round1);
        rndsFistma.addTransition(this.rounds.round1);
        rndsFistma.addTransition(this.rounds.round2);
        rndsFistma.addTransition(this.rounds.round3);
        rndsFistma.addTransition(this.rounds.round4);
        rndsFistma.addTransition(this.rounds.round5);
        rndsFistma.addOnEnter(this.rounds.round1, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round2, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round3, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round4, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round5, this._onRoundEnter.bind(this));

        console.log("YO1:", this.dataStore.Name, "why is this undefined?");

        this.dataStore.Name = "Some initial value";
        console.log("YO2:", this.dataStore.Name);

        console.log("SCHEMA:", SchemaBuilder.fetchSchema(RoundModel));
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
    }

    public Navigate(round: RoundModel){
        this.dataStore.RoundsFistma.goTo(round);
    }
    
    /**
     * Go to next game round
     * 
     */
    public advanceRound(){
        this.dataStore.RoundsFistma.next();
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){
        this.dataStore.RoundsFistma.previous();
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}