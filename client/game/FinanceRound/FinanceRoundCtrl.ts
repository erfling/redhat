'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import DataStore from '../../../shared/base-sapien/client/DataStore'
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import GameCtrl from '../GameCtrl';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import ApplicationCtrl from '../../ApplicationCtrl';
import { SliderValueObj } from '../../../shared/entity-of-the-state/ValueObj';

export default class FinanceRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: FinanceRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): FinanceRoundCtrl {
        if (!this._instance) {
            this._instance = new FinanceRoundCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

        return this._instance;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public SaveBid( response: ResponseModel, question: QuestionModel, round: SubRoundModel ):Promise<SubRoundModel> {
        console.log("ROUND IS:", round, question, GameCtrl.GetInstance().dataStore);
        response.Score = 0;
        response.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
        response.targetObjId = this.dataStore.ApplicationState.CurrentTeam._id;
        response.QuestionId = question._id;
        response.RoundId = round.RoundId;
        response.SubRoundId = round._id;
        response.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
        response.Answer[0].label = "BID";
        this.dataStore.ApplicationState.FormIsSubmitting = response.IsSaving = true;
        
        return SapienServerCom.SaveData(response, SapienServerCom.BASE_REST_URL + "gameplay/bid").then(r => {
            console.log(r);
            question.Response = Object.assign(new ResponseModel(), r);
            round.Responses = round.Responses.map(resp => resp._id == r._id ? Object.assign(new ResponseModel(), r) : resp);
            this.dataStore.ApplicationState.FormIsSubmitting = false;

            ApplicationCtrl.GetInstance().addToast("Your response has been saved.")

            return round;
        }).catch(() => {
            ApplicationCtrl.GetInstance().addToast("Your response could not be saved.", "danger")

            return round;
        })
    }

    public async getResponsesByRound(r: SubRoundModel): Promise<SubRoundModel> {
        if(this.component.props.location.pathname.indexOf("teamrating") != -1){

            await SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "gameplay/get4bresponses" + "/" + this.dataStore.ApplicationState.CurrentTeam.GameId).then((responses: QuestionModel[])=> {
                return r.Questions = responses.filter(q => q.Text.indexOf("Team " + this.dataStore.ApplicationState.CurrentTeam.Number) == -1);
            });

        } else {
            await super.getResponsesByRound(r);
        }
        return r
    }

    protected _setUpFistma(reactComp: Component){
        this.component = reactComp;
        var compStates = {
            sub1: ComponentsVO.Pricing,
            sub2: ComponentsVO.Bid,
            sub3: ComponentsVO.AcquisitionStructure
        };
        
        this.ComponentFistma = new FiStMa(compStates, compStates.sub1);
        
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
        this.dataStore.Round.Name = "FINANCE";

    }

    public updateRatingResponse(question: QuestionModel, response: ResponseModel) { 
        console.log("RESPONSE", response);       
        this.dataStore.Round.SubRounds.filter(sr => sr._id == question.SubRoundId).forEach(sr => {
            if(sr.Questions)
                sr.Questions.forEach(q => {
                    if ( question._id == q._id && (!q.TargetTeamId || q.TargetTeamId == response.targetObjId ) ){
                        q.Response = response;
                        q.PossibleAnswers = (response.Answer as SliderValueObj[]);
                    }
                })
        });
        
    }

}