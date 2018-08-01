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

    public getContentBySubRound(): void {
        var subroundName = window.location.pathname.split("/").filter(str => str.length).pop().toUpperCase();
        if(subroundName == "DEALRENEWAL"){
            SapienServerCom.GetData(new SubRoundModel(), null, SapienServerCom.BASE_REST_URL + "rounds/subround/" + subroundName + "/" + this.dataStore.ApplicationState.CurrentUser.Job + "/" + this.dataStore.ApplicationState.CurrentTeam._id).then((r: SubRoundModel) => {
                const sr = Object.assign(new SubRoundModel(), r);
                this.dataStore.Round.SubRounds = this.dataStore.Round.SubRounds.filter(sr => sr._id != r._id).concat(sr);
                const messageProp = this._getMessageProp(this.dataStore.ApplicationState.CurrentUser.Job)
                

                DataStore.ApplicationState.CurrentMessages 
                    = this.dataStore.ApplicationState.CurrentMessages 
                    = ApplicationCtrl.GetInstance().dataStore.ApplicationState.CurrentMessages
                    = GameCtrl.GetInstance().ChildController.dataStore.ApplicationState.CurrentMessages 
                    = this.getMessagesByJob(this.dataStore.ApplicationState.CurrentUser.Job, sr._id);

                if (messageProp) this.dataStore.ApplicationState.SelectedMessage 
                    = DataStore.ApplicationState.SelectedMessage 
                    = GameCtrl.GetInstance().ChildController.dataStore.ApplicationState.SelectedMessage
                    = DataStore.ApplicationState.CurrentMessages.filter(m => m.IsDefault)[0] || null;

                console.log("GOT THIS BACK FOR 3B", sr, r);
                return sr;
                //return this.MapResponsesToQuestions(sr, sr.Questions[0].Response);
            }).then(this.getResponsesByRound.bind(this));
        
        } else {
            super.getContentBySubRound();
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
        //(this.Response.Answer as SliderValueObj[]).push((r.Answer as SliderValueObj));
       // this.updateResponse(q, r);

        console.log("BUILT OUT RESPONSE",this.Response, this._responseMap);
    }

    _getPrice(){
        var initialPrice = this._responseMap[ComparisonLabel.PRICE] && this._responseMap[ComparisonLabel.QUANTITY] ? (this._responseMap[ComparisonLabel.PRICE].data / this._responseMap[ComparisonLabel.QUANTITY].data * 1000 ) : 0;
        var price = this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT] && (this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT].data == true || this._responseMap[ComparisonLabel.PROJECT_MANAGEMENT].data == true.toString()) ? initialPrice * 1.1 : initialPrice;
        return Math.round(price);
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
        return csat;
    }

    _getScore(questions: QuestionModel[]){

        //determine the max possible score
        let maxPrice = this._responseMap[ComparisonLabel.PRICE] ? this._responseMap[ComparisonLabel.PRICE].max : 0;
        let maxQuant = this._responseMap[ComparisonLabel.QUANTITY] ? this._responseMap[ComparisonLabel.QUANTITY].max : 0;
        let maxMoney = maxPrice * maxQuant
        let score = MathUtil.roundTo(this._responseMap[ComparisonLabel.PRICE].data * this._responseMap[ComparisonLabel.QUANTITY].data / maxMoney,2) * 10;

        console.warn( maxPrice, maxQuant,maxMoney, this._getPrice() * this._responseMap[ComparisonLabel.QUANTITY].data, score, this._responseMap)
        return score;
    }

    SaveResponses(subround: SubRoundModel, question: QuestionModel){
       /*
            let response = q.Response;
            response.Score = 0;
            response.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
            response.QuestionId = q._id;
            response.RoundId = subround.RoundId;
            response.SubRoundId = subround._id;
            response.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
            this.dataStore.ApplicationState.FormIsSubmitting = response.IsSaving = true;
        
*/

        this.Response.SkipScoring = true;
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
            UserScores: null

        };
        this.dataStore.Round.Name = "SALES";

    }

    public GetFeedback(srID){
        return SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "rounds/round3responses" + "/" + this.dataStore.ApplicationState.CurrentTeam.GameId + "/" + srID).then(r =>
            this.dataStore.Feedback = r
        )
    }

}