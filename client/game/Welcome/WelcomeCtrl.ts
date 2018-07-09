'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import Welcome from './Welcome';
import Intro from './Intro';
import PlayerLogin from './PlayerLogin';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import GameCtrl from '../GameCtrl';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import DataStore from '../../../shared/base-sapien/client/DataStore'
import ICommonComponentState from '../../../shared/base-sapien/client/ICommonComponentState';
import TeamModel from '../../../shared/models/TeamModel';
import UserModel from '../../../shared/models/UserModel';


export default class WelcomeCtrl extends BaseRoundCtrl<RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: WelcomeCtrl;

    protected readonly ComponentStates = {
        sub1: Intro,
        sub2: PlayerLogin
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);

        if (reactComp) this._setUpFistma(reactComp);

    }

    public static GetInstance(reactComp?: Component<any, any>): WelcomeCtrl {
        if (!WelcomeCtrl._instance) {
            WelcomeCtrl._instance = new WelcomeCtrl(reactComp || null);
        }

        if (!WelcomeCtrl._instance) throw new Error("NO INSTANCE");
        if (reactComp) WelcomeCtrl._instance._setUpFistma(reactComp)

        return WelcomeCtrl._instance;
    }


    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------
  
    public LoginPlayer(){
        this.dataStore.ApplicationState.FormError = null;
        SapienServerCom.SaveData({
            Email: this.dataStore.ApplicationState.CurrentUser.Email, 
            GamePIN: this.dataStore.ApplicationState.CurrentGame.GamePIN}, 
            SapienServerCom.BASE_REST_URL + "auth").then((r:{team: TeamModel, user: UserModel, token: string}) => {

                console.log("returned", r)

                localStorage.setItem("RH_USER", JSON.stringify(r.user))
                localStorage.setItem("RH_TEAM", JSON.stringify(r.team))
                localStorage.setItem("rhjwt", r.token);

                this.dataStore.ApplicationState.CurrentTeam = this.dataStore.ApplicationState.CurrentTeam = Object.assign(new TeamModel(), r.team)
                this.dataStore.ApplicationState.CurrentUser = this.dataStore.ApplicationState.CurrentUser = Object.assign(new UserModel(), r.user)

                GameCtrl.GetInstance().navigateOnClick("/game/peopleround/priorities");
                GameCtrl.GetInstance().pollForGameStateChange(r.team.GameId)
                return r;
        }).catch((r) => {
            this.dataStore.ApplicationState.FormError = "There was a problem logging you in. Please try again.";
        })


    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component){  
        console.log("INTDO ROUND IS", this)

        this.component = reactComp;
        this.dataStore = {
            Round: new RoundModel(),
            ApplicationState: DataStore.ApplicationState,
            SelectedSubround: null
        };        
        this.dataStore.Round.Name = "WELCOME";

  
        this.ComponentFistma.addOnEnter(this.ComponentStates.sub1, this.getContentBySubRound.bind(this));
        this.ComponentFistma.addOnEnter(this.ComponentStates.sub2, this.getContentBySubRound.bind(this));

        this.getContentBySubRound.bind(this)();

    }

}