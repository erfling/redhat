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
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';

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
        super(reactComp);
        this.dataStore.Name = "PEOPLE";

        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub2);
        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));

        this.getContentBySubRound.bind(this)();
    }

    public static GetInstance(reactComp?: Component<any, any>): PeopleRoundCtrl {
        if (!this._instance && reactComp) {
            this._instance = new PeopleRoundCtrl(reactComp);
        }
        if (!this._instance) throw new Error("NO INSTANCE");

        return this._instance;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public Save1AResponse( resp: ValueObj[], question: QuestionModel, round: SubRoundModel ) {
        const response = new ResponseModel();
        response.Answer = resp;
        response.TeamId = GameCtrl.GetInstance().dataStore.CurrentTeam._id;
        response.QuestionId = question._id;
        response.Question = question;
        response.RoundId = round._id;
        response.GameId = GameCtrl.GetInstance().dataStore.CurrentTeam.GameId;
        console.log("ROUND IS:", round, question,GameCtrl.GetInstance().dataStore);

        return SapienServerCom.SaveData(response, SapienServerCom.BASE_REST_URL + "gameplay/response").then(r => {
            console.log(r);
            round.Responses = round.Responses.map(resp => resp._id == r._id ? Object.assign(new ResponseModel(), r) : resp);
            return round;
        })

    }
  

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}