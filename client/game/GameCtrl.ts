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

        console.log("GAME NAV INFO:", this.component.props)

        var rndsFistma = this.dataStore.RoundsFistma = new FiStMa(this.rounds, this.rounds.round1);
        this.component.props.history.push("/game/" + this.dataStore.RoundsFistma.currentState.WrappedComponent.name.toLowerCase());
        rndsFistma.addTransition(this.rounds.round1);
        rndsFistma.addTransition(this.rounds.round2);
        rndsFistma.addTransition(this.rounds.round3);
        rndsFistma.addTransition(this.rounds.round4);
        rndsFistma.addTransition(this.rounds.round5);
        rndsFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
        this.NavigateFromState();

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

    public NavigateFromState(){
        console.log("WRAPPED COMPONENT IS: ",this.dataStore.RoundsFistma.currentState.WrappedComponent.name);
        this.component.props.history.push('/game/' + this.dataStore.RoundsFistma.currentState.WrappedComponent.name.toLowerCase());
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}