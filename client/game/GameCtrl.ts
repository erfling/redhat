'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import UserModel, { JobName } from '../../shared/models/UserModel';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import TeamModel from '../../shared/models/TeamModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import PeopleRoundCtrl from './PeopleRound/PeopleRoundCtrl';
import EngineeringRoundCtrl from './EngineeringRound/EngineeringRoundCtrl';
import WelcomeCtrl from './Welcome/WelcomeCtrl';
import ApplicationCtrl from '../ApplicationCtrl';
import ComponentsVO from '../../shared/base-sapien/client/ComponentsVO';

export default class GameCtrl extends BaseClientCtrl<IControllerDataStore & {Game: GameModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: GameCtrl;

    private _childController: BaseRoundCtrl<any>;

    public readonly ComponentStates = {
        round0: ComponentsVO.Welcome,
        round1: ComponentsVO.PeopleRound, 
        round2: ComponentsVO.EngineeringRound, 
        round3: ComponentsVO.SalesRound, 
        round4: ComponentsVO.FinanceRound, 
        round5: ComponentsVO.CustomerRound
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp?: Component<any, any>) {
        super(null, reactComp || null);

        if (reactComp) this._setUpFistma(reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): GameCtrl {
        if (!this._instance) {
            this._instance = new GameCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");
        if (reactComp) this._instance._setUpFistma(reactComp);

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
        let targetState: React.ComponentClass;
        let mapping = new RoundChangeMapping();            

        this._childController = this._getTargetController(this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME);

        if ( this._childController.ComponentFistma && this._childController.ComponentFistma.getNext() ){
            mapping.ParentRound = this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME;
            mapping.ChildRound = this._childController.ComponentFistma.getNext().WrappedComponent.CLASS_NAME;
        } else if ( this.ComponentFistma.getNext() ) {
            mapping.ParentRound = this.ComponentFistma.getNext().WrappedComponent.CLASS_NAME;
            this._childController = this._getTargetController(this.ComponentFistma.getNext().WrappedComponent.CLASS_NAME)

            //get the first component from the NEXT fistma
            console.log("CHILD CONTROLLER IS:", this._childController)
            mapping.ChildRound = this._childController.ComponentFistma.getFirst().WrappedComponent.CLASS_NAME;
        }

        console.log("MAPPING IS", mapping)

        if ( mapping.ParentRound && mapping.ChildRound ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.ApplicationState.CurrentTeam.GameId);
        }
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){
        let targetState: React.ComponentClass;
        let mapping: RoundChangeMapping = new RoundChangeMapping();

        this._childController = this._getTargetController(this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME)

        if ( this._childController.ComponentFistma && this._childController.ComponentFistma.getPrevious() ){
            mapping.ParentRound = this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME;
            mapping.ChildRound = this._childController.ComponentFistma.getPrevious().WrappedComponent.CLASS_NAME;
        } else if ( this.ComponentFistma.getPrevious() ) {
            mapping.ParentRound = this.ComponentFistma.getPrevious().WrappedComponent.CLASS_NAME;
            this._childController = this._getTargetController(this.ComponentFistma.getPrevious().WrappedComponent.CLASS_NAME)

            //get the first component from the NEXT fistma

            mapping.ChildRound = this._childController.ComponentFistma.getLast().WrappedComponent.CLASS_NAME;
        }

        console.log("MAPPING IS", mapping)

        if ( mapping.ParentRound && mapping.ChildRound ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.ApplicationState.CurrentTeam.GameId);
        }
    }

    private _getTargetController(componentName: string): BaseRoundCtrl<any>{
        let childController: BaseRoundCtrl<any>
        componentName = componentName.toLocaleUpperCase();
        switch(componentName){
            case "WELCOME":
                childController = WelcomeCtrl.GetInstance();
                break;
            case "PEOPLEROUND":
                childController = PeopleRoundCtrl.GetInstance();
                break;
            case "ENGINEERINGROUND":
                childController = EngineeringRoundCtrl.GetInstance();
                break;
            default: 
                childController = null;
                break;
        }

        return childController;
    }

    public NavigateFromState(){
        console.log("WRAPPED COMPONENT IS: ",this.ComponentFistma.currentState.WrappedComponent.name);
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public async pollForGameStateChange(gameId: string){
        console.log("polling for game state")
        if(!gameId)return;
        await SapienServerCom.GetData(null, null, "/listenforgameadvance/" + gameId).then((r: RoundChangeMapping) => {
            console.log("GOT THIS BACK FROM LONG POLL", r);

            this._childController = this._getTargetController(r.ParentRound)

            GameCtrl.GetInstance().navigateOnClick("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());
            this._childController.navigateOnClick("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());

            this.dataStoreChange();
            this._childController.dataStoreChange();


            const targetJob = r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] || JobName.IC;
            this.dataStore.ApplicationState.CurrentUser.Job = targetJob;

            ApplicationCtrl.GetInstance().addToast("The game is in a new round", "info");
            ApplicationCtrl.GetInstance().addToast("You're now playing the roll of " + targetJob, "info");

            this.pollForGameStateChange(gameId);
        }).catch(() => {
            setTimeout(() => {
                this.pollForGameStateChange.bind(this)(gameId);
            }, 2000);
        })
    }

    private _setUpFistma(reactComp: Component) {
        this.component = reactComp;

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.round0);
        this.ComponentFistma.addTransition(this.ComponentStates.round0);
        this.ComponentFistma.addTransition(this.ComponentStates.round1);
        this.ComponentFistma.addTransition(this.ComponentStates.round2);
        this.ComponentFistma.addTransition(this.ComponentStates.round3);
        this.ComponentFistma.addTransition(this.ComponentStates.round4);
        this.ComponentFistma.addTransition(this.ComponentStates.round5);
        this.ComponentFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        this.ComponentFistma.onInvalidTransition(this._onInvalidTrans);

        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel();      
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel();

        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null,
            Game: new GameModel()
        };

        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState)
        this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId)

        this.component.componentDidMount = () => {
            if (this.component.props.location.search){
                console.log("FOUND LOCATION SEARCH", this.component.props.location.search, this.ComponentFistma.currentState.WrappedComponent);
            }

            this.component.props.history.push("/game/" + this.ComponentFistma.currentState.WrappedComponent.CLASS_NAME.toLowerCase());
            this.navigateOnClick.bind(this)(this.component.props.location.pathname);
        }
    }

}