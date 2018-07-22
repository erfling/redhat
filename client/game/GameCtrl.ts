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

export default class GameCtrl extends BaseClientCtrl<IControllerDataStore & {Game: GameModel, _mobileWidth: boolean}>
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
    
    
    public goToMapping(mapping: Partial<RoundChangeMapping>){
        if ( mapping.ParentRound && mapping.ChildRound ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.ApplicationState.CurrentTeam.GameId);
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
        console.log("polling for game state", this.dataStore.ApplicationState.CurrentTeam)

        let url = "/listenforgameadvance/" + this.dataStore.ApplicationState.CurrentTeam.GameId;
        if(this.dataStore.ApplicationState.CurrentTeam.CurrentRound){
            url = url + "?ParentRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound || "" + "&ChildRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ChildRound || "";
        }

        await SapienServerCom.GetData(null, null, url).then((r: RoundChangeMapping) => {


            //set the team's current location to the new location
            const team = this.dataStore.ApplicationState.CurrentTeam = JSON.parse(localStorage.getItem("RH_TEAM"));
            team.CurrentRound = r;
            localStorage.setItem("RH_TEAM", JSON.stringify(team));

            console.log("<<<<<<<<<<<<TEAM IS NOW>>>>>>>>>>>>", this.dataStore.ApplicationState.CurrentTeam, JSON.parse(localStorage.getItem("RH_TEAM")))

            

            console.log("GOT THIS BACK FROM LONG POLL", r);
            const targetJob = r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] || JobName.IC;
            console.log("HELLO?")

            this.dataStore.ApplicationState.CurrentUser.Job 
                = GameCtrl.GetInstance().dataStore.ApplicationState.CurrentUser.Job 
                = targetJob;

            this._childController = this._getTargetController(r.ParentRound)

            console.log("CHILD CONTROLLER IS",this._childController);

            //GameCtrl.GetInstance().navigateOnClick("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());
            this._childController.navigateOnClick("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());

            this.dataStoreChange();
            this._childController.dataStoreChange();

            //ApplicationCtrl.GetInstance().addToast("The game is in a new round", "info");
            //ApplicationCtrl.GetInstance().addToast("You're now playing the roll of " + targetJob, "info");
            
            this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId);
        }).catch(() => {
            setTimeout(() => {
                this.pollForGameStateChange.bind(this)(this.dataStore.ApplicationState.CurrentTeam.GameId);
            }, 2000);
        })
    }

    private _setUpFistma(reactComp: Component) {
        this.component = reactComp;

        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel();      
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel();

        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null,
            Game: new GameModel(),
            _mobileWidth: window.innerWidth < 767
        };

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.round0);
        this.ComponentFistma.addTransition(this.ComponentStates.round0);
        this.ComponentFistma.addTransition(this.ComponentStates.round1);
        this.ComponentFistma.addTransition(this.ComponentStates.round2);
        this.ComponentFistma.addTransition(this.ComponentStates.round3);
        this.ComponentFistma.addTransition(this.ComponentStates.round4);
        this.ComponentFistma.addTransition(this.ComponentStates.round5);
        this.ComponentFistma.addOnEnter("*", this._onRoundEnter.bind(this));
        this.ComponentFistma.onInvalidTransition(this._onInvalidTrans);

        this.dataStore.ComponentFistma = this.ComponentFistma;

        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState)
        this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId)

    }

}