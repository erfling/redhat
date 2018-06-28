import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import PeopleRound from './PeopleRound/PeopleRound';
import EngineeringRound from './EngineeringRound/EngineeringRound';
import SalesRound from './SalesRound/SalesRound';
import FinanceRound from './FinanceRound/FinanceRound';
import CustomerRound from './CustomerRound/CustomerRound';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import UserModel from '../../shared/models/UserModel';
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import TeamModel from '../../shared/models/TeamModel';

export default class GameCtrl extends BaseClientCtrl<GameModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: GameCtrl;

    protected readonly ComponentStates = {
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

    private constructor(reactComp: Component<any, any>) {
        super( new GameModel(), reactComp );

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.round1);
        console.log("GAME NAV INFO:",  this.ComponentFistma.currentState.WrappedComponent)

        this.ComponentFistma.addTransition(this.ComponentStates.round1);
        this.ComponentFistma.addTransition(this.ComponentStates.round2);
        this.ComponentFistma.addTransition(this.ComponentStates.round3);
        this.ComponentFistma.addTransition(this.ComponentStates.round4);
        this.ComponentFistma.addTransition(this.ComponentStates.round5);
        this.ComponentFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        this.ComponentFistma.onInvalidTransition(this._onInvalidTrans);


        DataStore.GamePlay.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel()        
        DataStore.GamePlay.CurrentTeam = localStorage.getItem("TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("TEAM") ) ) : new TeamModel()        
        this.dataStore = DataStore.GamePlay;

        this.component.componentDidMount = () => {
            if (this.component.props.location.search){
                console.log("FOUND LOCATION SEARCH", this.component.props.location.search, this.ComponentFistma.currentState.WrappedComponent);
            }

            this.component.props.history.push("/game/" + this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME.toLowerCase());
            this.navigateOnClick(this.component.props.location.pathname);
        }
    }

    public static GetInstance(reactComp?: Component<any, any>): GameCtrl {
        if (!this._instance && reactComp) {
            this._instance = new GameCtrl(reactComp);
        }
        if (!this._instance) throw new Error("NO INSTANCE");

        return this._instance;
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
        this.component.props.history.push("/game/" + this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME.toLowerCase());
    }
    
    /**
     * Go to next game round
     * 
     */
    public advanceRound(){
        this.ComponentFistma.next();
        this.component.props.history.push("/game/" + this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME.toLowerCase());
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){
        this.ComponentFistma.previous();
        this.component.props.history.push("/game/" + this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME.toLowerCase());

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