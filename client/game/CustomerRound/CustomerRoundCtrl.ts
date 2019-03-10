import { SliderValueObj } from './../../../shared/entity-of-the-state/ValueObj';
'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import DataStore from '../../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import QuestionModel, { QuestionType } from '../../../shared/models/QuestionModel';
import ResponseModel, { ResponseFetcher } from '../../../shared/models/ResponseModel';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';

export default class CustomerRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: CustomerRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
        
        if (reactComp) this._setUpFistma(reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): CustomerRoundCtrl {
        if (!this._instance) {
            this._instance = new CustomerRoundCtrl(reactComp || null);
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

    protected _setUpFistma(reactComp: Component){
        this.component = reactComp;
        var compStates = {
            sub1: ComponentsVO.CustomerSub,
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
        this.dataStore.Round.Name = "CUSTOMER";

    }

    public async getResponsesByRound(r: SubRoundModel): Promise<SubRoundModel> {
        const fetcher: ResponseFetcher = {
          SubRoundId: r._id,
          TeamId: this.dataStore.ApplicationState.CurrentTeam._id,
          GameId: this.dataStore.ApplicationState.CurrentTeam.GameId
        };
    
        await SapienServerCom.SaveData(
          fetcher,
          SapienServerCom.BASE_REST_URL + "gameplay/roundresponses/"
        ).then((responses: ResponseModel[]) => {
          return (r.Questions = r.Questions.map(q => {
            q.Response =
              responses
                .filter(resp => resp.QuestionId == q._id)
                .map(resp => Object.assign(new ResponseModel(), resp))[0] || null;
    
            if(!q.Reponse){
              const r = new ResponseModel();
              r.QuestionId = q.id;
              r.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
              r.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
              r.UserId = this.dataStore.ApplicationState.CurrentUser._id;
              r.TeamNumber = this.dataStore.ApplicationState.CurrentTeam.Number;
              
              const answer = new SliderValueObj();
              r.Answer = answer;
              q.Response = r;
            }
    
            return q;
          }));
        });
    
        return r;
      }


}