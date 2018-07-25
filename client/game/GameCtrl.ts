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
import SalesRoundCtrl from './SalesRound/SalesRoundCtrl';
import FinanceRound from './FinanceRound/FinanceRound';
import FinanceRoundCtrl from './FinanceRound/FinanceRoundCtrl';
import CustomerRoundCtrl from './CustomerRound/CustomerRoundCtrl';

export default class GameCtrl extends BaseClientCtrl<IControllerDataStore & {Game: GameModel, _mobileWidth: boolean}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: GameCtrl;

    private _childController: BaseRoundCtrl<any>;

    public ChildController: BaseClientCtrl<any>;


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp?: Component<any, any>) {
        super(null, reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): GameCtrl {
        if (!this._instance) {
            this._instance = new GameCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

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
    
    public goToMapping(mapping: Partial<RoundChangeMapping>){
        if ( mapping.ParentRound && mapping.ChildRound ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.ApplicationState.CurrentTeam.GameId).then(r => {
                console.log("RESPONSE FROM SERVER FROM ROUND ADVANCE POST", r)
            });
        }
    }

    public _getTargetController(componentName: string): BaseRoundCtrl<any>{
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
            case "SALESROUND":
                childController = SalesRoundCtrl.GetInstance();
                break;
            case "FINANCEROUND":
                childController = FinanceRoundCtrl.GetInstance();
            case "CUSTOMERROUND":
                childController = CustomerRoundCtrl.GetInstance();
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
        if(!this.dataStore.ApplicationState.CurrentTeam)return;
        //console.log("polling for game state", this.dataStore.ApplicationState.CurrentTeam)

        let url = "/listenforgameadvance/" + this.dataStore.ApplicationState.CurrentTeam.GameId;
        if(this.dataStore.ApplicationState.CurrentTeam.CurrentRound){
            url = url + "?ParentRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound || "" + "&ChildRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ChildRound || "";
        }

        await SapienServerCom.GetData(null, null, url).then((r: RoundChangeMapping) => {
            //set the team's current location to the new location
            //console.log("GOT THIS BACK FROM LONG POLL", r);
            this.component.props.history.push("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());

            if (this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound.toUpperCase() != r.ParentRound.toUpperCase()){
                const team = this.dataStore.ApplicationState.CurrentTeam = JSON.parse(localStorage.getItem("RH_TEAM"));
                team.CurrentRound = r;
                localStorage.setItem("RH_TEAM", JSON.stringify(team));

                //console.log("<<<<<<<<<<<<TEAM IS NOW>>>>>>>>>>>>", this.dataStore.ApplicationState.CurrentTeam, JSON.parse(localStorage.getItem("RH_TEAM")));
                const targetJob = r.UserJobs && r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] ? r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] : JobName.IC;

                this.dataStore.ApplicationState.CurrentUser.Job = targetJob;
            }
            this._childController = this._getTargetController(r.ParentRound);
            
            setTimeout(() => {
                this.pollForGameStateChange.bind(this)(this.dataStore.ApplicationState.CurrentTeam.GameId);
            }, 2000);
            
        }).catch(() => {
            setTimeout(() => {
                this.pollForGameStateChange.bind(this)(this.dataStore.ApplicationState.CurrentTeam.GameId);
            }, 2000);
            
        })
    }

    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        var compStates = {
            round0: ComponentsVO.Welcome,
            round1: ComponentsVO.PeopleRound, 
            round2: ComponentsVO.EngineeringRound, 
            round3: ComponentsVO.SalesRound, 
            round4: ComponentsVO.FinanceRound, 
            round5: ComponentsVO.CustomerRound
        };

        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel();      
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel();

        this.ComponentFistma = new FiStMa(compStates, compStates.round0);
        this.ComponentFistma.addTransition(compStates.round0);
        this.ComponentFistma.addTransition(compStates.round1);
        this.ComponentFistma.addTransition(compStates.round2);
        this.ComponentFistma.addTransition(compStates.round3);
        this.ComponentFistma.addTransition(compStates.round4);
        this.ComponentFistma.addTransition(compStates.round5);
        this.ComponentFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        this.ComponentFistma.onInvalidTransition(this._onInvalidTrans);

        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma,
            Game: new GameModel(),
            _mobileWidth: window.innerWidth < 767
        };

        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState);
        this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId);
    }

}