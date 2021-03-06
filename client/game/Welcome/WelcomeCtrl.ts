'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import GameCtrl from '../GameCtrl';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import DataStore from '../../../shared/base-sapien/client/DataStore'
import TeamModel from '../../../shared/models/TeamModel';
import UserModel, { RoleName } from '../../../shared/models/UserModel';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import ApplicationCtrl from '../../ApplicationCtrl';

export default class WelcomeCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: WelcomeCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): WelcomeCtrl {
        if (!this._instance) {
            this._instance = new WelcomeCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

        return this._instance;
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
                

                localStorage.setItem("RH_USER", JSON.stringify(r.user))
                localStorage.setItem("rhjwt", r.token);

                this.dataStore.ApplicationState.CurrentUser = this.dataStore.ApplicationState.CurrentUser = Object.assign(new UserModel(), r.user)

                if (r.user.Role == RoleName.FACILITATOR || r.user.Role == RoleName.ADMIN) {
                    this.component.props.history.push('/facilitator/base/' + r.team.GameId);
                } else {
                    this.dataStore.ApplicationState.CurrentTeam = this.dataStore.ApplicationState.CurrentTeam = Object.assign(new TeamModel(), r.team)

                    localStorage.setItem("RH_TEAM", JSON.stringify(r.team))
                    this.component.props.history.push("/game/peopleround/priorities");
                    GameCtrl.GetInstance().getCurrentMapping();
                    GameCtrl.GetInstance().dataStoreChange();
                    //ApplicationCtrl.GetInstance().addToast("You are now playing the role of " + r.user.Job, "info");
                    this.dataStore.HasShownJobToast = true;
                }

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
        this.component = reactComp;
        var compStates = {
            sub1: ComponentsVO.Intro,
            sub2: ComponentsVO.PlayerLogin
        };

        this.ComponentFistma = new FiStMa(compStates, compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub1);

        this.dataStore = {
            Round: new RoundModel(),
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma,
            SubRound: null,
            RatingQuestions: null,
            Scores: null,
            UserScores: null,
            UserRatings: null,
            HasShownJobToast: false
        };        
        this.dataStore.Round.Name = "WELCOME";
    }

}