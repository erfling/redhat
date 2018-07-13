'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import EngineeringSub from './EngineeringSub';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import RoundModel from '../../../shared/models/RoundModel';
import DataStore from '../../../shared/base-sapien/client/DataStore';

export default class EngineeringRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: EngineeringRoundCtrl;

    protected readonly ComponentStates = {
        sub1: EngineeringSub
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp);
        
        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);
    }

    public static GetInstance(reactComp?: Component<any, any>): EngineeringRoundCtrl {
        if (!this._instance) {
            this._instance = new EngineeringRoundCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");
        if(reactComp) this._instance._setUpFistma(reactComp)
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
        this.dataStore = {
            Round: new RoundModel(),
            SelectedSubround: null,
            ComponentFistma: this.ComponentFistma,
            ApplicationState: DataStore.ApplicationState,
        };
        this.dataStore.Round.Name = "ENGINEERING";
    }

}