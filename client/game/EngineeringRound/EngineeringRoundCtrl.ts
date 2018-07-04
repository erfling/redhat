'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';

export default class EngineeringRoundCtrl extends BaseRoundCtrl<RoundModel>
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
        super(reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): EngineeringRoundCtrl {
        if (!this._instance) {
            this._instance = new EngineeringRoundCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");
        if(reactComp) this._instance.component = reactComp;
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
        //this.dataStore.Name = "ENGINEERING";
    }

}