'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import UserModel, { JobName, RoleName } from '../../shared/models/UserModel';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import TeamModel from '../../shared/models/TeamModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import PeopleRoundCtrl from './PeopleRound/PeopleRoundCtrl';
import EngineeringRoundCtrl from './EngineeringRound/EngineeringRoundCtrl';
import WelcomeCtrl from './Welcome/WelcomeCtrl';
import ComponentsVO from '../../shared/base-sapien/client/ComponentsVO';
import SalesRoundCtrl from './SalesRound/SalesRoundCtrl';
import FinanceRoundCtrl from './FinanceRound/FinanceRoundCtrl';
import CustomerRoundCtrl from './CustomerRound/CustomerRoundCtrl';
import ApplicationCtrl from '../ApplicationCtrl';



export default class GameCtrl extends BaseClientCtrl<IControllerDataStore & {Game: GameModel, _mobileWidth: boolean, ShowGameInfoPopup: boolean, ShowDecisionPopup: boolean, ShowInboxPopup: boolean; GrowMessageIndicator: boolean}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: GameCtrl;

    private _childController: BaseRoundCtrl<any>;

    public ChildController: BaseClientCtrl<any>;

    public LockedInJob: JobName;

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

    public async ReadMessage(messageId: string){
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "gameplay" + "/readmessage/" + messageId + "/" + this.dataStore.ApplicationState.CurrentUser._id).then((user: UserModel) => {
            if(!user) throw new Error("didn't save user");
            let u = Object.assign(new UserModel(), user, {Job: this.dataStore.ApplicationState.CurrentUser.Job});
            this.dataStore.ApplicationState.CurrentUser = this.ChildController.dataStore.ApplicationState.CurrentUser = u;
            localStorage.setItem("RH_USER", JSON.stringify(u));
            this.getMessageCount();
        })
        .catch((err) => {
            console.error(err)
        })
    }

    public getMessageCount(){
        let count = 0;
        this.dataStore.ApplicationState.CurrentMessages.forEach(m => {
            if (this.dataStore.ApplicationState.CurrentUser.ReadMessages.indexOf(m._id) == -1) count++;
        })
        this.dataStore.ApplicationState.UnreadMessages = count;
        if(count > 0){
            this.dataStore.GrowMessageIndicator = true;
            setTimeout(() => {
                this.dataStore.GrowMessageIndicator = false;
            }, 8750)
        }
    }

    private _timeOut;

    public async pollForGameStateChange(gameId: string){


        console.error("CURRENT TEAM:::::>>>>>>>>>", this.dataStore.ApplicationState.CurrentTeam);

        if(!this.dataStore.ApplicationState.CurrentTeam || !this.dataStore.ApplicationState.CurrentTeam.GameId)return;
        //console.log("polling for game state", this.dataStore.ApplicationState.CurrentTeam)

        let url = "/listenforgameadvance/" + this.dataStore.ApplicationState.CurrentTeam.GameId;
        if (this.dataStore.ApplicationState.CurrentTeam.CurrentRound) {
            url = url + "?ParentRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound + "&ChildRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ChildRound;
            //url = url + "?ParentRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound || "" + "&ChildRound=" + this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ChildRound || "";
        }

        await SapienServerCom.GetData(null, null, url).then((r: RoundChangeMapping) => {
            //set the team's current location to the new location
            const targetJob = r.UserJobs && r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] ? r.UserJobs[this.dataStore.ApplicationState.CurrentUser._id] : JobName.IC;

            if (r.ShowFeedback != undefined && (this.dataStore.ApplicationState.ShowFeedback == undefined || this.dataStore.ApplicationState.ShowFeedback != r.ShowFeedback)){
                this.dataStore.ApplicationState.ShowFeedback = this.ChildController.dataStore.ApplicationState.ShowFeedback = r.ShowFeedback;
                (this.ChildController as BaseRoundCtrl<any>).getScores();
            }

            if (r.ShowIndividualFeedback != undefined && (this.dataStore.ApplicationState.ShowIndividualFeedback == undefined || this.dataStore.ApplicationState.ShowIndividualFeedback != r.ShowIndividualFeedback)){
                this.dataStore.ApplicationState.ShowIndividualFeedback = this.ChildController.dataStore.ApplicationState.ShowIndividualFeedback = r.ShowIndividualFeedback;
                (this.ChildController as BaseRoundCtrl<any>).getIndividualScores();
                DataStore.setThreeRandomNumbers();
            }

            if (r.ShowRateUsers != undefined && (this.dataStore.ApplicationState.ShowRateUsers == undefined || this.dataStore.ApplicationState.ShowFeedback != r.ShowRateUsers))this.dataStore.ApplicationState.ShowRateUsers = this.ChildController.dataStore.ApplicationState.ShowRateUsers = r.ShowRateUsers;

            if (this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ParentRound.toUpperCase() != r.ParentRound.toUpperCase() || this.dataStore.ApplicationState.CurrentTeam.CurrentRound.ChildRound.toUpperCase() != r.ChildRound.toUpperCase()){

                this.component.props.history.push("/game/" + r.ParentRound.toLowerCase() + "/" + r.ChildRound.toLowerCase());
                const team = this.dataStore.ApplicationState.CurrentTeam = JSON.parse(localStorage.getItem("RH_TEAM"));
                team.CurrentRound = r;
                localStorage.setItem("RH_TEAM", JSON.stringify(team));

            } else {
                if (this.ChildController && this.ChildController.hasOwnProperty("GetFeedback"))(this.ChildController as SalesRoundCtrl).GetFeedback((this.ChildController as SalesRoundCtrl).dataStore.SubRound._id);
                (this.ChildController as BaseRoundCtrl<any>).dataStore.ApplicationState.ShowFeedback = r.ShowFeedback;
                (this.ChildController as BaseRoundCtrl<any>).dataStore.ApplicationState.ShowRateUsers = r.ShowRateUsers;
            }

            //always be IC in login
            if(location.pathname.indexOf("welcome") != -1){
                this.dataStore.ApplicationState.CurrentUser.Job = this.ChildController.dataStore.ApplicationState.CurrentUser.Job = JobName.IC;
            } else if(targetJob != this.ChildController.dataStore.ApplicationState.CurrentUser.Job && !this.LockedInJob){
                this.dataStore.ApplicationState.CurrentUser.Job = this.ChildController.dataStore.ApplicationState.CurrentUser.Job = targetJob;
                ApplicationCtrl.GetInstance().addToast("You are now playing the role of " + this.ChildController.dataStore.ApplicationState.CurrentUser.Job, "info");
                (this.ChildController as BaseRoundCtrl<any>).getContentBySubRound();
            } 
            
            

            if(r.CurrentHighestBid && (!this.dataStore.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid || this.dataStore.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid.data != r.CurrentHighestBid.data)){
                        this.dataStore.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid = this.ChildController.dataStore.ApplicationState.CurrentTeam.CurrentHighestBid = r.CurrentHighestBid;
                        if(this.dataStore.ApplicationState.CurrentTeam.toString() == r.CurrentHighestBid.label){                            
                            ApplicationCtrl.GetInstance().addToast("Your team now has the high bid for BlueKite has increased to $" + r.CurrentHighestBid.data + "Bil.");

                        } else {
                            ApplicationCtrl.GetInstance().addToast("Team " + r.CurrentHighestBid.label + " now has the high bid for BlueKite has increased to $" + r.CurrentHighestBid.data + "Bil.", "info");
                        }
                        localStorage.setItem("RH_TEAM", JSON.stringify(this.ChildController.dataStore.ApplicationState.CurrentTeam));

            }


            //clearTimeout(this._timeOut);
            //let time = location.pathname.toUpperCase().indexOf('/BID') == -1 ? 3500 : 1500;
            //this._timeOut = setTimeout(() => {
                this.pollForGameStateChange.bind(this)(this.dataStore.ApplicationState.CurrentTeam.GameId);
            //}, time); 
           return;
        }).catch((err) => {
            console.log("CAUGHT ERROR", err)
            //clearTimeout(this._timeOut);
            //this._timeOut = setTimeout(() => {
                this.pollForGameStateChange.bind(this)(this.dataStore.ApplicationState.CurrentTeam.GameId);
            //}, 2500);
            console.log("bad connection!");
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
            _mobileWidth: window.innerWidth < 767,
            ShowDecisionPopup: false,
            ShowGameInfoPopup: false,
            ShowInboxPopup: false,
            GrowMessageIndicator: false
        };

        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState);
        this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId);
    }

    public getParentRound(): string{
        var pathname = location.pathname.split("/").filter(item => item.length);
        if(pathname.indexOf("game") == -1)return "";
        return pathname[pathname.length - 2];
    }

    public getChildRound(): string{
        if(location.pathname.indexOf("game") == -1)return "";
        return location.pathname.split("/").filter(item => item.length).pop();
    }

}