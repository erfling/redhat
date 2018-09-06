'use strict';
import { Component } from 'react';
import BaseRoundCtrl from '../../../shared/base-sapien/client/BaseRoundCtrl';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import DataStore from '../../../shared/base-sapien/client/DataStore';
import ComponentsVO from '../../../shared/base-sapien/client/ComponentsVO';
import RoundModel from '../../../shared/models/RoundModel';
import FiStMa from '../../../shared/entity-of-the-state/FiStMa';
import QuestionModel, { QuestionType, ComparisonLabel } from '../../../shared/models/QuestionModel';
import ResponseModel, { ResponseFetcher } from '../../../shared/models/ResponseModel';
import ValueObj, { SliderValueObj } from '../../../shared/entity-of-the-state/ValueObj';
import SubRoundModel from '../../../shared/models/SubRoundModel';
import SapienServerCom from '../../../shared/base-sapien/client/SapienServerCom';
import MessageModel from '../../../shared/models/MessageModel';
import ApplicationCtrl from '../../ApplicationCtrl';
import TeamModel from '../../../shared/models/TeamModel';
import GameCtrl from '../GameCtrl';
import MathUtil from '../../../shared/entity-of-the-state/MathUtil'

export default class SalesRoundCtrl extends BaseRoundCtrl<IRoundDataStore & {Feedback: TeamModel[]}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: SalesRoundCtrl;

    private _responseMap: any = {};
    public Response: ResponseModel = new ResponseModel();

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

    //overrides BaseRoundCtrl's getContentBySubRound because of special Sales Round question parsing
    public getContentBySubRound() {
        var subroundName = window.location.pathname.split("/").filter(str => str.length).pop().toUpperCase();
        if(subroundName == "DEALRENEWAL"){
            return super.getContentBySubRound()
                    .then((sr: SubRoundModel) => {
                        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "rounds/get2bquestions/" + this.dataStore.ApplicationState.CurrentTeam.GameId ).then((subround: SubRoundModel) => {
                            sr.Questions = this.dataStore.SubRound.Questions = subround.Questions;
                            return sr;
                        })
                    })
                    .then(this.getResponsesByRound.bind(this))
                    //.then(this.getScores);        
        } else {
            return super.getContentBySubRound();
        }
    }

    handleResponseChange(q: QuestionModel, r: ResponseModel, questions: QuestionModel[]) {
        this._responseMap[q.ComparisonLabel] = r.Answer[0];
        r.ComparisonLabel = q.ComparisonLabel;
        (r.Answer as SliderValueObj).label = q.ComparisonLabel.toLowerCase();

        var finalAnswer:Partial<SliderValueObj>[] = Object.keys(this._responseMap).map(label => {
            return {
                label,
                data: this._responseMap[label].data
            }
        })

        this.Response = Object.assign(this.Response, {
            Answer: finalAnswer.concat(
                [
                    {
                        label: ComparisonLabel.PRICE_PER_CUSTOMER,
                        data: this._getPrice()
                    }, 
                    {
                        label: ComparisonLabel.CSAT,
                        data: this._getCSAT()
                    },
                    r.Answer[0]
                ]
            ),
            Score: this._getScore(questions)
        });

        (this.Response.Answer as SliderValueObj[]).forEach(a => a.maxPoints = 20 / (this.Response.Answer as SliderValueObj[]).length )

        console.log("BUILT OUT RESPONSE",this.Response, this._responseMap);
    }

    _getPrice(){
        var initialPrice = this._responseMap[ComparisonLabel.PRICE] && this._responseMap[ComparisonLabel.QUANTITY] ? (this._responseMap[ComparisonLabel.PRICE].data / this._responseMap[ComparisonLabel.QUANTITY].data * 1000 ) : 0;
        return Math.round(initialPrice);
    }

    _getCSAT(){
        let csat = 0;
        if(this._getPrice()){
            csat = Math.pow(250/this._getPrice(), .5);
            if (this._responseMap && this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT] && (this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT].data == true || this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT].data == true.toString())){
                
                console.log("PROJECT MANAGEMENT", this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT]);
                csat *= 1.1;
            }
        }
        return csat + .15;
    }

    _getScore(questions: QuestionModel[]){
        
        //determine the max possible score
        let score = 0;

        if(this._responseMap[ComparisonLabel.QUANTITY] && this._responseMap[ComparisonLabel.PRICE]){
            score = ( 1 - ( Math.abs( ( ( this._responseMap[ComparisonLabel.PRICE].data / (this._responseMap[ComparisonLabel.QUANTITY].data * 1000) ) * 1000000 ) - 600 ) ) / 350)-0.2
        }

        console.log("NOW SEE: ", score, this._responseMap[ComparisonLabel.QUANTITY].data, this._responseMap[ComparisonLabel.PRICE].data, this._responseMap[ComparisonLabel.PRICE].data / this._responseMap[ComparisonLabel.QUANTITY].data);

        score = this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT] && this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT].data == "true" ? score + .2 : score;
        score *= 10;
        console.log("score fix *10: %s", score);

        return score;
    }

    SaveResponses(subround: SubRoundModel, question: QuestionModel){
       
        this.Response.SkipScoring = true;
        this.Response.MaxScore = 10;
        this.Response.UserId = this.dataStore.ApplicationState.CurrentUser._id;
        
        this.SaveResponse(this.Response, question, subround).then(
           (r) => this.MapResponsesToQuestions(r, this.Response)
        )
        
    }

    public async getResponsesByRound(r: SubRoundModel): Promise<SubRoundModel> {
        const fetcher: ResponseFetcher = {
            SubRoundId: r._id,
            TeamId: this.dataStore.ApplicationState.CurrentTeam._id,
            GameId: this.dataStore.ApplicationState.CurrentTeam.GameId
        }

        await SapienServerCom.SaveData(fetcher, SapienServerCom.BASE_REST_URL + "gameplay/roundresponses/").then((responses: ResponseModel[])=> {
            return r = this.MapResponsesToQuestions(r, responses[0])
        });

        return r;
    }

    public MapResponsesToQuestions(subRound: SubRoundModel, resp: ResponseModel){
        if(!resp) return

        this.Response = resp;
        subRound.Questions.forEach(q => {
            q.Response = new ResponseModel();
            q.Response.Score = 0;
            q.Response.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
            q.Response.QuestionId = q._id;
            q.Response.RoundId = subRound._id;
            q.Response.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
            (q.Response.Answer as ValueObj) = (resp.Answer as ValueObj[]).filter(a => a.label == q.ComparisonLabel)[0] || new ValueObj();
        })

        console.log("MAPPED SR", subRound, resp)
        return subRound;
    }

    protected _setUpFistma(reactComp: Component) {
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
            ComponentFistma: this.ComponentFistma,
            Feedback: null,
            SubRound: null,
            RatingQuestions: null,
            Scores: null,
            UserScores: null,
            UserRatings: null
        };
        this.dataStore.Round.Name = "SALES";

    }
    public getScores(){
        const url = SapienServerCom.BASE_REST_URL + "gameplay/getscores/" + this.dataStore.ApplicationState.CurrentTeam.GameId;
        return SapienServerCom.GetData(null, null, url).then(r => {
            console.log(r);

            //hide decisions and messages so feedback can be seen
            DataStore.ApplicationState.ShowMessageList = this.dataStore.ApplicationState.ShowMessageList = ApplicationCtrl.GetInstance().dataStore.ApplicationState.ShowMessageList = false
            DataStore.ApplicationState.ShowQuestions = this.dataStore.ApplicationState.ShowQuestions = ApplicationCtrl.GetInstance().dataStore.ApplicationState.ShowQuestions = false

            this.dataStore.Scores = r;
            return this.dataStore.Scores;
        })
        .then(this.getChartingScores.bind(this))
        .then(this.getResponsesBySubround.bind(this))
    }

    public GetFeedback(){
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "rounds/round3responses" + "/" + this.dataStore.ApplicationState.CurrentTeam.GameId + "/").then(r =>
            this.dataStore.Feedback = r
        )
    }

}