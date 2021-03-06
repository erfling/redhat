'use strict';
import { Component } from 'react';
import BaseRoundCtrl, {IRoundDataStore} from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import DataStore from '../../../shared/base-sapien/client/DataStore'
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import ApplicationCtrl from '../../ApplicationCtrl';
import TeamModel from '../../../shared/models/TeamModel';
import GameCtrl from '../GameCtrl';

export default class PeopleRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: PeopleRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): PeopleRoundCtrl {
        if (!this._instance) {
            this._instance = new PeopleRoundCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

        return this._instance;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public Save1AResponse( response: ResponseModel, question: QuestionModel, round: SubRoundModel ) {
        // build response
        if (!response) {
            response = new ResponseModel();
            response.Answer = question.PossibleAnswers;
        }

        (response.Answer as ValueObj[]).forEach((val, index) => {
            val.data = index.toString(); // write index to val.data for scoring
        });
        
        response.targetObjId = this.dataStore.ApplicationState.CurrentTeam._id;

        // save response //
        this.SaveResponse(response, question, round);
    }

    public saveTeamName(){

        return SapienServerCom.SaveData(this.dataStore.ApplicationState.CurrentTeam, SapienServerCom.BASE_REST_URL + "gameplay/saveteamname").then((t:TeamModel) => {
            ApplicationCtrl.GetInstance().addToast("Your team's name has been saved");

        }).catch(() => {
            ApplicationCtrl.GetInstance().addToast("Your team name couldn't be saved.","danger")
        })
    }

    public Save1BResponse( resp: ResponseModel, question: QuestionModel, round: SubRoundModel ) {
        console.log(resp, question, round);
        resp.SiblingQuestionId = question.SiblingQuestionId;
        resp.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
        resp.targetObjId = this.dataStore.ApplicationState.CurrentTeam._id;
        resp.QuestionId = question._id;
        resp.RoundId = round.RoundId;
        resp.SubRoundId = round._id;
        resp.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
        // save response //
        return SapienServerCom.SaveData(resp, SapienServerCom.BASE_REST_URL + "gameplay/1bresponse").then(r => {
            console.log(r);
            round.Responses = round.Responses.map(resp => resp._id == r._id ? Object.assign(new ResponseModel(), r) : resp);
            ApplicationCtrl.GetInstance().addToast("Your response has been saved");
            return round;
        });
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        var compStates = {
            sub1: ComponentsVO.Priorities,
            sub2: ComponentsVO.Hiring
        };
        
        this.ComponentFistma = new FiStMa(compStates, compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub2);
        
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
        this.dataStore.Round.Name = "PEOPLE";
    }

    public pollForTeamName(){
        return SapienServerCom.GetData(null, TeamModel, SapienServerCom.BASE_REST_URL + "gameplay/listenforteamname/" + this.dataStore.ApplicationState.CurrentTeam._id).then((t: TeamModel) => {
            if(!t) throw new Error();
            DataStore.ApplicationState.CurrentTeam =
            ApplicationCtrl.GetInstance().dataStore.ApplicationState.CurrentTeam = 
            this.dataStore.ApplicationState.CurrentTeam = t;
            localStorage.setItem("RH_TEAM", JSON.stringify(t));
            if(location.pathname.indexOf("prior") != -1){
                this.pollForTeamName();
            }
        }).catch(() => setTimeout(() => this.pollForTeamName(), 1000))
    }

}