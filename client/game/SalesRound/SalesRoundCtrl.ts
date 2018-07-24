'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import DataStore from '../../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import QuestionModel, { QuestionType } from '../../../shared/models/QuestionModel';
import ResponseModel from '../../../shared/models/ResponseModel';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';

export default class SalesRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: SalesRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): SalesRoundCtrl {
        if (!this._instance) {
            this._instance = new SalesRoundCtrl(reactComp || null);
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

    handleResponseChange(q: QuestionModel, r: ResponseModel, questions: QuestionModel[]){

        console.log("PASSED ANSWER", r.Answer)

        //special case for handling answer that disables other answers
        if(q.Text.toUpperCase().indexOf("UNLIMITED ") != -1 ){

            //this.dataStore.Round.Questions.
            questions.forEach(q => {
                if(q.Type == QuestionType.SLIDER)q.PossibleAnswers[0].disabled = (r.Answer as ValueObj).data == true.toString();//toString because DB requires single type for all response answers, so string makes the most sense
            });

        }

        this.updateResponse(q, r)
    }

    protected _setUpFistma(reactComp: Component){
        this.component = reactComp;
        var compStates = {
            sub1: ComponentsVO.DealStructure,
            sub2: ComponentsVO.DealRenewal
        };

        this.ComponentFistma = new FiStMa(compStates, compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub2);
        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));
        
        this.dataStore = {
            Round: new RoundModel(),
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma
        };
        this.dataStore.Round.Name = "SALES";

        this.getContentBySubRound();
    }


}