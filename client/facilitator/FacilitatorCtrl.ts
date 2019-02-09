'use strict';
import GameModel from '../../shared/models/GameModel';
import FacilitationRoundResponseMapping from '../../shared/models/FacilitationRoundResponseMapping';
import { Component } from 'react';
import UserModel, { JobName, RoleName } from '../../shared/models/UserModel';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import RoundChangeLookup from '../../shared/models/RoundChangeLookup';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import TeamModel from '../../shared/models/TeamModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import GameCtrl from '../game/GameCtrl';
import { sortBy, groupBy } from 'lodash';
import SubRoundScore from '../../shared/models/SubRoundScore';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import QuestionModel, { QuestionType } from '../../shared/models/QuestionModel';
import { SliderValueObj } from '../../shared/entity-of-the-state/ValueObj';
import ResponseModel from '../../shared/models/ResponseModel';

export interface IScores{
    SubRoundScores: SubRoundScore[];
    RoundScores: SubRoundScore[];
    CumulativeScores: SubRoundScore[];
}

export interface IFacilitatorDataStore {
    Game: GameModel;
    _mobileWidth: boolean;
    ShowGameInfoPopup: boolean;
    ShowDecisionPopup: boolean;
    ShowInboxPopup: boolean; 
    GrowMessageIndicator: boolean;
    groupedResponses: any;
    SlideNumber: number;
    RoundChangeLookups: RoundChangeLookup[];
    CurrentLookup: RoundChangeLookup;
    RoundResponseMappings: FacilitationRoundResponseMapping[];
    AccordionIdx: number[],
    FullScreen: boolean,
    ShowRolesModal?: boolean;
    ModalTeam?: FacilitationRoundResponseMapping;
    FacilitatorScores: IScores;
    SlideScores: IScores
    SelectedTeamMapping: FacilitationRoundResponseMapping;
    ModalRoundFilter: {
        value: string,
        showRatings: boolean,
        rounds:string[]
        ratingRounds:string[]
    }
}

export default class FacilitatorCtrl extends BaseClientCtrl<{FacilitatorState: IFacilitatorDataStore, ApplicationState: ICommonComponentState }>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private static _instance: FacilitatorCtrl;

    private _childController: BaseRoundCtrl<any>;

    public ChildController: BaseClientCtrl<any>;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    private constructor(reactComp?: Component<any, any>) {
        super(null, reactComp || null);
    }

    public static GetInstance(reactComp?: Component<any, any>): FacilitatorCtrl {
        if (!this._instance) {
            this._instance = new FacilitatorCtrl(reactComp || null);
            if (!this._instance) throw new Error("NO INSTANCE");
        } else if (reactComp) this._instance._setUpFistma(reactComp);

        return this._instance;
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    public onClickChangeSlide(forwardOrBack: 1 | -1): void{
        let number = this.dataStore.FacilitatorState.SlideNumber + forwardOrBack;

        let lookup = this.dataStore.FacilitatorState.RoundChangeLookups.filter(lu => {
            return lu.MinSlideNumber <= number && lu.MaxSlideNumber >= number;
        })[0];

        if (!lookup && this.dataStore.FacilitatorState.Game){
            lookup = new RoundChangeLookup();
            let cr = this.dataStore.FacilitatorState.Game.CurrentRound;
            lookup.SlideNumber = number;
            lookup.Round = cr.ParentRound;
            lookup.RoundId = cr.RoundId;
            lookup.SubRound = cr.ChildRound;
        }

        if(lookup){
            let mapping = new RoundChangeMapping();
            mapping.ParentRound = lookup.Round;
            mapping.ChildRound = lookup.SubRound;
            mapping.SlideNumber = number;
            mapping.GameId = this.dataStore.FacilitatorState.Game._id;
            mapping.ShowFeedback = lookup.ShowFeedback;
            mapping.ShowIndividualFeedback = lookup.ShowIndividualFeedback;
            mapping.ShowRateUsers = lookup.ShowRateUsers;
            mapping.SlideFeedback = lookup.SlideFeedback;
            mapping.SkipRoundScore = lookup.SkipRoundScore;

            console.log("LOOKUPS",lookup, mapping);

            console.log("GOING TO: ", mapping, this.dataStore.FacilitatorState.SlideNumber, this.dataStore.FacilitatorState.CurrentLookup,  this.dataStore.FacilitatorState.CurrentLookup.SlideFeedback);

            //are we showing the leaderboard on the slide screen?
            let hold = false;
            if (this.dataStore.FacilitatorState.CurrentLookup && this.dataStore.FacilitatorState.CurrentLookup.SlideFeedback && !isNaN(this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx)) {
                hold = true;
                //see where we should cut off the scores
                if (!this.dataStore.FacilitatorState.CurrentLookup.NumTeamsShown) {
                    this.dataStore.FacilitatorState.CurrentLookup.NumTeamsShown = this.dataStore.FacilitatorState.Game.Teams.length;                   
                }

                //manage which scores are currently shown
                //first, show the round scores, one by one.
                if (this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx != -1) { 
                    this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx = this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx - forwardOrBack;
                } 
                //when we are out of round scores, begin showing cumulative scores
                else if (this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx) {
                    this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx = this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx - forwardOrBack
                } 
                //when are are out of both round and cumulative scores, let the app move on to the next slide/game state
                else {
                    this.dataStore.FacilitatorState.SlideScores.RoundScores = null;
                    hold = false;
                }

                if (this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx > this.dataStore.FacilitatorState.Game.Teams.length) {
                    hold = false;
                }

                console.log("WHY NOT?", this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx, )

            }

            this.dataStore.FacilitatorState.SlideNumber = hold ? this.dataStore.FacilitatorState.SlideNumber : number;
            this.dataStore.FacilitatorState.CurrentLookup = hold ? this.dataStore.FacilitatorState.CurrentLookup : lookup;

            if (!hold) this.goToMapping(mapping);
            
        }
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public getRoundInfo(){ 
        const SpecialSlides = {
            "2" : {
                ShowTeams: true
            },
            "7" : {
                Video: "https://videos.learning.redhat.com/media/MSX+Round+1/1_pquxisag/101643261"
            },
            "8": {
                ShowPin: true
            },
            "15": {
                SlideFeedback: true
            },
            "26": {
                SlideFeedback: true
            },
            "36" : {
                Video: "https://videos.learning.redhat.com/media/MSX+Round+2/1_v166k9tj/101643261"
            },
            "40": {
                SlideFeedback: true
            },
            "50" : {
                Video: "https://videos.learning.redhat.com/playlist/dedicated/101643261/1_cdih1vr4/1_lxi24e1w"
            },
            "53": {
                SlideFeedback: true
            },
            "58": {
                SlideFeedback: true
            },
            "66": {
                Video: "https://videos.learning.redhat.com/media/MSX+Round+5/1_h5dp4u6x/101643261"
            },
            "70": {
                SlideFeedback: true
            }
            ,
            "76": {
                SlideFeedback: true,
                SkipRoundScore: true
            }
        }

        return SapienServerCom.GetData(null,  FacilitationRoundResponseMapping, SapienServerCom.BASE_REST_URL + "facilitator/getroundstatus/" + this.dataStore.FacilitatorState.Game._id).then((rcl: FacilitationRoundResponseMapping[]) => {
            
            let slideMapping = (rcl[0] as FacilitationRoundResponseMapping).CurrentRound;

            this.dataStore.FacilitatorState.RoundResponseMappings = rcl;
            this.dataStore.FacilitatorState.SlideNumber = slideMapping.SlideNumber;
            if (!this.dataStore.FacilitatorState.AccordionIdx) this.dataStore.FacilitatorState.AccordionIdx = (rcl as FacilitationRoundResponseMapping[]).map((lookup, i) => i)


            if(slideMapping.SlideNumber.toString() in SpecialSlides){
                slideMapping = Object.assign(slideMapping, SpecialSlides[this.dataStore.FacilitatorState.SlideNumber.toString()])
                if (slideMapping.SlideFeedback && !this.dataStore.FacilitatorState.Game.CurrentRound.SlideFeedback) {
                    this.getChartingScores();
                }
            } else {
                this.dataStore.FacilitatorState.SlideScores.CumulativeScores = null;
                this.dataStore.FacilitatorState.SlideScores.RoundScores = null;
            }


            this.dataStore.FacilitatorState.Game.CurrentRound = slideMapping;
            if(!this.dataStore.FacilitatorState.ModalRoundFilter.value) this.dataStore.FacilitatorState.ModalRoundFilter.value = rcl[0].SubRoundLabel;

            this.component.setState({FacilitatorState: this.dataStore.FacilitatorState})

            return rcl;
        })        
    }

    public getLookups(){   
        return SapienServerCom.GetData(null,  RoundChangeLookup, SapienServerCom.BASE_REST_URL + "facilitator/getroundchangelookups").then(rcl => {
            this.dataStore.FacilitatorState.RoundChangeLookups = rcl as RoundChangeLookup[];
            console.log(this.dataStore.FacilitatorState.SlideNumber, this.dataStore.FacilitatorState.Game.CurrentRound.SlideNumber)
            return rcl;
        })        
    }

    public goToMapping(mapping: Partial<RoundChangeMapping>){

        let gameId;
        if(this.dataStore.FacilitatorState.Game){
            gameId = this.dataStore.FacilitatorState.Game._id
        } else if (this.dataStore.ApplicationState.CurrentTeam) {
            gameId = this.dataStore.ApplicationState.CurrentTeam._id
        } else if (this.dataStore.ApplicationState.CurrentGame){
            gameId = this.dataStore.ApplicationState.CurrentGame._id
        }

        if ( mapping.ParentRound && mapping.ChildRound && gameId ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.FacilitatorState.Game._id).then(r => {
                console.log("RESPONSE FROM SERVER FROM ROUND ADVANCE POST", r);
                const vidSlideNumbers: number[] = [7, 32, 44, 57];

                if(vidSlideNumbers.indexOf(this.dataStore.FacilitatorState.SlideNumber) != -1){
                    this.dataStore.FacilitatorState.FullScreen = false;
                    window.focus();
                }
            });
        }
    }

    public getGame(id: string){
        //alert("getting game " + id)
        return SapienServerCom.GetData(null, GameModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/" + id).then((g: GameModel) => {
            this.dataStore.FacilitatorState.Game = g;
            this.dataStore.FacilitatorState.SlideNumber = g.CurrentRound.SlideNumber || 1;
            console.log("HEY", this.dataStore.FacilitatorState, g.CurrentRound, this.dataStore.FacilitatorState.CurrentLookup);

            if (!this.dataStore.FacilitatorState.CurrentLookup || !this.dataStore.FacilitatorState.CurrentLookup.MaxSlideNumber){
                let lookups = this.dataStore.FacilitatorState.RoundChangeLookups.filter(lu => {
                    return lu.MinSlideNumber <=  g.CurrentRound.SlideNumber && lu.MaxSlideNumber >=  g.CurrentRound.SlideNumber;
                })

                if (lookups.length) this.dataStore.FacilitatorState.CurrentLookup = lookups[0];
            }

            return this.dataStore.FacilitatorState.Game;
        })
    }

    public gotToSlide(){
        GameCtrl.GetInstance().dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = DataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber++;

        this.goToMapping(this.dataStore.FacilitatorState.RoundChangeLookups[this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber])
    }

    protected _setUpFistma(reactComp: Component) {
       console.log("DS, YO",DataStore);
        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel();      
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel();

        this.dataStore = {
            FacilitatorState: DataStore.FacilitatorState,
            ApplicationState: DataStore.ApplicationState
        }
        //this.dataStore.ApplicationState.CurrentTeam = null;

        console.log("DATASTORE APPLICATION:",this.dataStore, this.component);

    }

    public getChartingScores(){
        //getsubroundscores
        const url = SapienServerCom.BASE_REST_URL + "gameplay/getsubroundscores/" + this.dataStore.FacilitatorState.Game._id + "/" + this.dataStore.FacilitatorState.Game.CurrentRound.ChildRound;
        SapienServerCom.GetData(null, null, url).then(srs => {
            let r = srs.map((sr: SubRoundScore) => Object.assign(new SubRoundScore(), Object.assign(sr, {NormalizedScore: sr.NormalizedScore * 100})))
            console.log(r);

            //Object.assign(this.dataStore.Scores, r);
            this.dataStore.FacilitatorState.SlideScores.SubRoundScores = r;
            this.dataStore.FacilitatorState.SlideScores.RoundScores = this.getRoundRanking(r);
            this.dataStore.FacilitatorState.SlideScores.CumulativeScores = this.getCumulativeTeamScores(r);
        })
    }


    getRoundRanking(scores: SubRoundScore[], allScores: boolean = false) {
        let selectedRoundScores = scores.filter(rs => rs.RoundLabel == Math.max(...Object.keys(groupBy(scores, "RoundLabel")).map(k => Number(k))).toString())
        
        let groupedTeamScores = groupBy(selectedRoundScores, "TeamId")
        
        let accumulatedScores = Object.keys( groupedTeamScores ).map(k => {
          let accumulatedScore = new SubRoundScore();
          accumulatedScore.TeamId = k;
          accumulatedScore.TeamLabel = groupedTeamScores[k][0].TeamLabel;
          accumulatedScore.NormalizedScore = groupedTeamScores[k].reduce((totalScore, srs) => {
            return totalScore + srs.NormalizedScore;
          },0) / groupedTeamScores[k].length; 
          return accumulatedScore;
        })
        selectedRoundScores = sortBy(accumulatedScores, "NormalizedScore")

        if(this.dataStore.FacilitatorState.Game.Teams.length > 2) {
            this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx = Math.max(3, this.dataStore.FacilitatorState.Game.Teams.length - 2);
        } else {
            this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx = this.dataStore.FacilitatorState.Game.Teams.length;
        }

        if (this.dataStore.FacilitatorState.CurrentLookup.SkipRoundScore) this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx = -1;

        return !allScores ? selectedRoundScores.reverse().slice(0, this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx) : selectedRoundScores.reverse();
      }

      getCumulativeTeamScores(scores: SubRoundScore[], allScores: boolean = false) {
        let groupedTeamScores = groupBy(scores,"TeamId");
    
        let accumulatedScores = Object.keys( groupedTeamScores ).map(k => {
          let accumulatedScore = new SubRoundScore();
          accumulatedScore.TeamId = k;
          accumulatedScore.TeamLabel = groupedTeamScores[k][0].TeamLabel;
          accumulatedScore.NormalizedScore = groupedTeamScores[k].reduce((totalScore, srs) => {
            return totalScore + srs.NormalizedScore;
          },0) / groupedTeamScores[k].length; 
          return accumulatedScore;
        })

        if(this.dataStore.FacilitatorState.Game.Teams.length > 2) {
            this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx = Math.max(3, this.dataStore.FacilitatorState.Game.Teams.length - 2);
        } else {
            this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx = this.dataStore.FacilitatorState.Game.Teams.length;
        }

        return !allScores ? sortBy(accumulatedScores, "NormalizedScore").reverse().slice(0, this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx) : sortBy(accumulatedScores, "NormalizedScore").reverse();
    }

    public async getFacilitatorScores(){
        const url = SapienServerCom.BASE_REST_URL + "facilitator/getscores/" + this.dataStore.FacilitatorState.Game._id;
        return SapienServerCom.GetData(null, null, url).then(srs => {
            let r = srs.map((sr: SubRoundScore) => Object.assign(new SubRoundScore(), Object.assign(sr, {NormalizedScore: sr.NormalizedScore * 100})))
            console.log(r);

            //Object.assign(this.dataStore.Scores, r);
            this.dataStore.FacilitatorState.FacilitatorScores.SubRoundScores = r;
            this.dataStore.FacilitatorState.FacilitatorScores.RoundScores = this.getRoundRanking(r);
            this.dataStore.FacilitatorState.FacilitatorScores.CumulativeScores = this.getCumulativeTeamScores(r);
            this.component.setState({
                FacilitatorState: this.dataStore.FacilitatorState
            })
        })
    }

    public async UpdateTeamJobs(team: FacilitationRoundResponseMapping){

        this.dataStore.ApplicationState.ValidationErrors = this.validateTeamJobs(team, this.dataStore.FacilitatorState.Game);

        if(this.dataStore.ApplicationState.ValidationErrors.every(err => typeof err == 'boolean')){
            team.IsSaving = true;
            SapienServerCom.SaveData(team, SapienServerCom.BASE_REST_URL + "games/team/roles").then(g => {
                this.dataStore.FacilitatorState.Game = g;
                this.dataStore.FacilitatorState.ModalTeam = null;
                this.dataStore.FacilitatorState.ShowRolesModal = false;
                team.IsSaving = false;
            }); 
            
        }
    }          

    public async getTeamResponses(team: FacilitationRoundResponseMapping, childRound: string){
        this.dataStore.FacilitatorState.SelectedTeamMapping = team;
        const url = `${SapienServerCom.BASE_REST_URL}facilitator/getteamresponses/${team.TeamId}`
        return SapienServerCom.GetData(null, null, url).then((questions: QuestionModel[]) => {
            questions = this.arrange2AResponses(questions);
            this.dataStore.FacilitatorState.SelectedTeamMapping.Questions = questions;
            this.component.setState({
                FacilitatorState: this.dataStore.FacilitatorState
            })
        })
    }


    public validateTeamJobs(team: FacilitationRoundResponseMapping, game: GameModel = this.dataStore.FacilitatorState.Game): (boolean | string) [] {
        

        const hasJob = (team: FacilitationRoundResponseMapping, jobName: JobName, limitToOne: boolean = false) => {
            return limitToOne ? team.Members.filter(m => m.Job == jobName).length == 1 || `Teams must have one ${jobName}`
                        : team.Members.some(m => m.Job == jobName) || `Teams must have at least one ${jobName}`;
        }

        const aintGotJob = (team: FacilitationRoundResponseMapping, jobName: JobName) => {
            return  team.Members.every(m => m.Job != jobName) || `Teams shoudn't include the ${jobName} role in this round.`
        }

        let validators: (boolean | string)[] = [hasJob(team, JobName.MANAGER, true)];

        switch(game.CurrentRound.ChildRound.toUpperCase()){

            case "ENGINEERINGSUB":
                validators = validators.concat([
                    hasJob(team, JobName.CHIPCO), 
                    hasJob(team, JobName.INTEGRATED_SYSTEMS),
                    aintGotJob(team, JobName.BLUE_KITE),
                    aintGotJob(team, JobName.IC)
                ]);
                break;

            case "ACQUISITIONSTRUCTURE":
                validators = validators.concat([
                    hasJob(team, JobName.BLUE_KITE, true),
                    aintGotJob(team, JobName.INTEGRATED_SYSTEMS),
                    aintGotJob(team, JobName.CHIPCO)
                ])   

                break;
            default:
                validators = validators.concat([
                    aintGotJob(team, JobName.BLUE_KITE),
                    aintGotJob(team, JobName.INTEGRATED_SYSTEMS),
                    aintGotJob(team, JobName.CHIPCO)
                ]) 
                break;

        }

        
        return validators;
    }

    public arrange2AResponses(questions: QuestionModel[]){

        let resp: ResponseModel;
        let qWith2AResponse: QuestionModel = questions.find(q => q.SubRoundLabel == "2A" && q.Response && q.Response._id != null)
        if(qWith2AResponse) {
            resp = qWith2AResponse.Response;
        }

        return questions.map(q => {
            if(q.SubRoundLabel != "2A" || !resp) return q;
            console.log("over here", resp)
            q.Response = new ResponseModel();
            if(q.Type == QuestionType.SLIDER){
                let answer = (resp.Answer as SliderValueObj[]).find(a => a.label == q.ComparisonLabel);
                if(answer){
                    let pa = (q.PossibleAnswers as SliderValueObj[]).find(a => a.label.toUpperCase() == q.ComparisonLabel.toUpperCase());
                    if(pa) {
                        answer.min = pa.min;
                        answer.max = pa.max;
                    }
                    if(answer.label == "PRICE") answer.idealValue = 180;
                    if(answer.label == "QUANTITY") answer.idealValue = 300;
                    (q.Response.Answer as SliderValueObj[]) = [answer];
                }else{
                    (q.Response.Answer as SliderValueObj[]) = [new SliderValueObj()];
                }
            } else {

                let answer = (resp.Answer as SliderValueObj[]).find(a => a.data == true || a.data == true.toString());
                if(answer){
                    (q.Response.Answer as SliderValueObj[]) = q.PossibleAnswers.map(pa => {
                        
                        if(pa.label == answer.label) {
                            answer.label = "Project Management";
                            return answer;
                        }
                        return pa;
                    })
                }
            }

            return q
        })

    }

    public getGroupedRatings(q:QuestionModel, prop: string){
        if(q.Response && q.Response.Answer) {
            let flats = (q.Response.Answer as SliderValueObj[]).reduce((flattened, a) => {
                return flattened.concat(a);
            },[])

            return groupBy(flats, prop);
        }
        console.log("RETURNING EMPTY")
        return [];
    }

    public getGroupedChildren(answers: SliderValueObj[], prop: string, round: string){
        let limited = answers.filter(a => a.SubRoundLabel && a.SubRoundLabel.indexOf(round) != -1);
        console.log("LIMITED", groupBy(limited, prop))
        return groupBy(limited, prop);
    }

/*
    public MapResponsesToQuestions(questions: QuestionModel[]){
        


        questions.forEach(q => {
            q.Response = new ResponseModel();
            q.Response.Score = 0;
            q.Response.TeamId = this.dataStore.ApplicationState.CurrentTeam._id;
            q.Response.QuestionId = q._id;
            q.Response.RoundId = subRound._id;
            q.Response.GameId = this.dataStore.ApplicationState.CurrentTeam.GameId;
            if(q.Type == QuestionType.SLIDER){
                let answer: SliderValueObj = (resp.Answer as SliderValueObj[]).find(a => a.label == q.ComparisonLabel);
                (q.Response.Answer as SliderValueObj[]) = answer ? [answer] : [new SliderValueObj()];
                console.log(q.Text, q.Response.Answer);
            } else {
                 (q.Response.Answer as SliderValueObj[]) = [(resp.Answer as SliderValueObj[]).find(a => a.data == true || a.data == true.toString())] || [new SliderValueObj()];
            }
        })

        return subRound;
    }
    */
}