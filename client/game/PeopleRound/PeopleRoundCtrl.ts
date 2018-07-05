'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import Hiring from './Hiring';
import Priorities from './Priorities';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import GameCtrl from '../GameCtrl';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import DataStore from '../../../shared/base-sapien/client/DataStore'

export default class PeopleRoundCtrl extends BaseRoundCtrl<RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: PeopleRoundCtrl;

    protected readonly ComponentStates = {
        sub1: Priorities,
        sub2: Hiring
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
        this.ComponentFistma.addTransition(this.ComponentStates.sub2);
        console.log("dere")

        if (reactComp) this._setUpFistma(reactComp);

    }

    public static GetInstance(reactComp?: Component<any, any>): PeopleRoundCtrl {
        if (!PeopleRoundCtrl._instance) {
            console.log("jere")
            PeopleRoundCtrl._instance = new PeopleRoundCtrl(reactComp || null);
        }

        if (!PeopleRoundCtrl._instance) throw new Error("NO INSTANCE");
        if (reactComp) PeopleRoundCtrl._instance._setUpFistma(reactComp)

        return PeopleRoundCtrl._instance;
    }
    //        if(reactComp) this._instance.component = reactComp;


    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public Save1AResponse( resp: ValueObj[], question: QuestionModel, round: SubRoundModel ) {
        // calculate score //
        var score:number = 0;
        resp.forEach((val, index) => {
            var distFromExpected:number = Math.abs( val.data - (index + 1) );
            if (distFromExpected < 2) score += 2 - distFromExpected;
            console.log(val.label, "Dist:",distFromExpected, "Dist < 2:", distFromExpected < 2, 2 - distFromExpected);
        });
        console.log("SCORE:", score);
        // build response //
        const response = new ResponseModel();
        response.Answer = resp;
        response.Score = score;
        response.TeamId = GameCtrl.GetInstance().dataStore.CurrentTeam._id;
        response.QuestionId = question._id;
        response.Question = question;
        response.RoundId = round._id;
        response.GameId = GameCtrl.GetInstance().dataStore.CurrentTeam.GameId;
        // save response //
        this.SaveResponse(response, question, round);
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component){  
        console.log("PEOPLE ROUND IS", this)

        this.component = reactComp;
        this.dataStore = Object.assign(new RoundModel(), DataStore.ApplicationState)
        this.dataStore.Name = "PEOPLE";

        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));

        this.getContentBySubRound.bind(this)();

    }

}