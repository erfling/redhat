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
            Scores: null
        };
        this.dataStore.Round.Name = "CUSTOMER";

    }


}