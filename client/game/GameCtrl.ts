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
        super( new GameModel(), reactComp );

        console.log("GAME NAV INFO:", this.component.props)

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.round1);
        //this.component.props.history.push("/game/" + this.dataStore.RoundsFistma.currentState.WrappedComponent.name.toLowerCase());
        this.ComponentFistma.addTransition(this.ComponentStates.round1);
        this.ComponentFistma.addTransition(this.ComponentStates.round2);
        this.ComponentFistma.addTransition(this.ComponentStates.round3);
        this.ComponentFistma.addTransition(this.ComponentStates.round4);
        this.ComponentFistma.addTransition(this.ComponentStates.round5);
        this.ComponentFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        this.ComponentFistma.onInvalidTransition(this._onInvalidTrans);

        console.log("YO1:", this.dataStore.Name, "why is this undefined?");

        this.dataStore.Name = "Some initial value";
        console.log("YO2:", this.dataStore.Name);
        this.dataStore = Object.assign(new GameModel(), {
            ComponentFistma: this.ComponentFistma
        })

        
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        this.NavigateFromState();

    }

    private _onInvalidTrans(from:any, to:any): void {
        console.log("_onInvalidTrans callback fired!", "from:", from, "to:", to);
    }

    public Navigate(round: RoundModel){
        this.ComponentFistma.goTo(round);
    }
    
    /**
     * Go to next game round
     * 
     */
    public advanceRound(){
        this.ComponentFistma.next();
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){
        this.ComponentFistma.previous();
    }

    public NavigateFromState(){
        console.log("WRAPPED COMPONENT IS: ",this.ComponentFistma.currentState.WrappedComponent.name);
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}