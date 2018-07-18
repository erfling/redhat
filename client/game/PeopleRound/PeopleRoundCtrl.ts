'use strict';
import { Component } from 'react';
import BaseRoundCtrl, {IRoundDataStore} from '../../../shared/base-sapien/client/BaseRoundCtrl';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../../shared/models/ResponseModel';
import QuestionModel from '../../../shared/models/QuestionModel';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import DataStore from '../../../shared/base-sapien/client/DataStore'
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';

export default class PeopleRoundCtrl extends BaseRoundCtrl<IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: PeopleRoundCtrl;

    protected readonly ComponentStates = {
        sub1: ComponentsVO.Priorities,
        sub2: ComponentsVO.Hiring
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp: React.Component<any, any>) {
        super(reactComp || null);

        if (reactComp) this._setUpFistma(reactComp);
    }

    public static GetInstance(reactComp?: Component<any, any>): PeopleRoundCtrl {
        if (!this._instance) {
            this._instance = new PeopleRoundCtrl(reactComp || null);
        }
        if (!this._instance) throw new Error("NO INSTANCE");
        if (reactComp) this._instance._setUpFistma(reactComp)

        return this._instance;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public Save1AResponse( response: ResponseModel, question: QuestionModel, round: SubRoundModel ) {
        // calculate score //
        var score:number = 0;
        if (!response) {
            response = new ResponseModel();
            response.Answer = question.PossibleAnswers;
        }
        (response.Answer as ValueObj[]).forEach((val, index) => {
            var distFromExpected:number = Math.abs( val.data - (index + 1) );
            if (distFromExpected < 2) score += 2 - distFromExpected;
            console.log(val.label, "Dist:",distFromExpected, "Dist < 2:", distFromExpected < 2, 2 - distFromExpected);
        });
        console.log("SCORE:", score);
        // build response //
        //const response = new ResponseModel();
        response.Score = score;
        response.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
        response.QuestionId = question._id;
        response.RoundId = round._id;
        response.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
        // save response //
        this.SaveResponse(response, question, round);
    }

    public Save1BResponse( resp: ResponseModel, question: QuestionModel, round: SubRoundModel ) {
        console.log(resp, question, round);
        resp.SiblingQuestionId = question.SiblingQuestionId;
        resp.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
        resp.QuestionId = question._id;
        resp.RoundId = round._id;
        resp.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
        // save response //
        return SapienServerCom.SaveData(resp, SapienServerCom.BASE_REST_URL + "gameplay/1bresponse").then(r => {
            console.log(r);
            round.Responses = round.Responses.map(resp => resp._id == r._id ? Object.assign(new ResponseModel(), r) : resp);
            return round;
        });
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    protected _setUpFistma(reactComp: Component) {
        this.component = reactComp;
        
        this.dataStore = {
            Round: new RoundModel(),
            SelectedSubround: null,
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: null
        };
        this.dataStore.Round.Name = "PEOPLE";
        
        this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub1);
        this.ComponentFistma.addTransition(this.ComponentStates.sub2);
        this.ComponentFistma.addOnEnter("*", this.getContentBySubRound.bind(this));

        this.dataStore.ComponentFistma = this.ComponentFistma;

        this.getContentBySubRound();
    }

}