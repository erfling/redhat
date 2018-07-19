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

    protected readonly ComponentStates = {
        sub1: ComponentsVO.EngineeringSub
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
        if (reactComp) this._instance._setUpFistma(reactComp);
        
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

        this.dataStore = {
            Round: new RoundModel(),
<<<<<<< HEAD
            SelectedMessage: null,
            ComponentFistma: this.ComponentFistma,
=======
            SelectedSubround: null,
>>>>>>> f56720953dfdf5759c1ef928d98538d3ef70ec75
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null
        };
        this.dataStore.Round.Name = "ENGINEERING";

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);
        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));

        this.dataStore.ComponentFistma = this.ComponentFistma;

        this.getContentBySubRound();
    }

}