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
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';

export default class GameCtrl extends BaseClientCtrl<GameModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    protected readonly ComponentStates = {
        round1: PeopleRound, 
        round2: EngineeringRound, 
        round3: SalesRound, 
        round4: FinanceRound, 
        round5: CustomerRound
    };

    protected ComponentFistma: FiStMa<any>


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( reactComp );

        console.log("GAME NAV INFO:", this.component.props)

        var rndsFistma = this.dataStore.RoundsFistma = new FiStMa(this.ComponentStates, this.ComponentStates.round1);
        //this.component.props.history.push("/game/" + this.dataStore.RoundsFistma.currentState.WrappedComponent.name.toLowerCase());
        rndsFistma.addTransition(this.ComponentStates.round1);
        rndsFistma.addTransition(this.ComponentStates.round2);
        rndsFistma.addTransition(this.ComponentStates.round3);
        rndsFistma.addTransition(this.ComponentStates.round4);
        rndsFistma.addTransition(this.ComponentStates.round5);
        rndsFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        rndsFistma.onInvalidTransition(this._onInvalidTrans);

        console.log("YO1:", this.dataStore.Name, "why is this undefined?");

        this.dataStore.Name = "Some initial value";
        console.log("YO2:", this.dataStore.Name);

        
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

    private _onInvalidTrans(from:any, to:any): void {
        console.log("_onInvalidTrans callback fired!", "from:", from, "to:", to);
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
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}