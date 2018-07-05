'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import Welcome from './Welcome';
import Intro from './Intro';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import GameCtrl from '../GameCtrl';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import DataStore from '../../../shared/base-sapien/client/DataStore'



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
  

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component){  
        console.log("INTDO ROUND IS", this)

        this.component = reactComp;
        this.dataStore = Object.assign(new RoundModel(), DataStore.ApplicationState)
        this.dataStore.Name = "PEOPLE";

        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));

        this.getContentBySubRound.bind(this)();

    }

}