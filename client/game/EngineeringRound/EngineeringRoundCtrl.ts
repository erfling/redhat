'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import RoundModel from '../../../shared/models/RoundModel';
import DataStore from '../../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';

export default class EngineeringRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: EngineeringRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): EngineeringRoundCtrl {
        if (!this._instance) {
            this._instance = new EngineeringRoundCtrl(reactComp || null);
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
            sub1: ComponentsVO.EngineeringSub
        };

        this.ComponentFistma = new FiStMa(compStates, compStates.sub1);
        this.ComponentFistma.addTransition(compStates.sub1);

        this.dataStore = {
            Round: new RoundModel(),
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma,
            SubRound: null

        };
        this.dataStore.Round.Name = "ENGINEERING";

    }

}