'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import FacilitationRoundResponseMapping from '../../shared/models/FacilitationRoundResponseMapping';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
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
import { lookup } from 'dns';

export interface IFacilitatorDataStore{
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
    Scores: SubRoundScore[];
    RoundScores: SubRoundScore[];
    CumulativeScores: SubRoundScore[];
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

            console.log("LOOKUPS",lookup, mapping);

            console.log("GOING TO: ", mapping, this.dataStore.FacilitatorState.SlideNumber, this.dataStore.FacilitatorState.CurrentLookup,  this.dataStore.FacilitatorState.CurrentLookup.SlideFeedback);

            //are we showing the leaderboard on the slide screen?
            let hold = false;
            if (this.dataStore.FacilitatorState.CurrentLookup && this.dataStore.FacilitatorState.CurrentLookup.SlideFeedback) {
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
                    this.dataStore.FacilitatorState.RoundScores = null;
                    hold = false;
                }

                if (this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx > this.dataStore.FacilitatorState.Game.Teams.length) {
                    hold = false;
                }

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
            "14": {
                SlideFeedback: true
            },
            "25": {
                SlideFeedback: true
            },
            "36" : {
                Video: "https://videos.learning.redhat.com/media/MSX+Round+2/1_v166k9tj/101643261"
            },
            "39": {
                SlideFeedback: true
            },
            "50" : {
                Video: "https://videos.learning.redhat.com/playlist/dedicated/101643261/1_cdih1vr4/1_lxi24e1w"
            },
            "53": {
                SlideFeedback: true
            },
            "57": {
                SlideFeedback: true
            },
            "66": {
                Video: "https://videos.learning.redhat.com/media/MSX+Round+5+with+slate/1_6o1ds131/101643261"
            },
            "69": {
                SlideFeedback: true
            }
        }

        return SapienServerCom.GetData(null,  FacilitationRoundResponseMapping, SapienServerCom.BASE_REST_URL + "facilitator/getroundstatus/" + this.dataStore.FacilitatorState.Game._id).then((rcl: FacilitationRoundResponseMapping[]) => {
            
            let slideMapping = (rcl[0] as FacilitationRoundResponseMapping).CurrentRound;

            this.dataStore.FacilitatorState.RoundResponseMappings = rcl;
            this.dataStore.FacilitatorState.SlideNumber = slideMapping.SlideNumber;
            if (!this.dataStore.FacilitatorState.AccordionIdx || !this.dataStore.FacilitatorState.AccordionIdx.length) this.dataStore.FacilitatorState.AccordionIdx = (rcl as FacilitationRoundResponseMapping[]).map((lookup, i) => i)


            if(slideMapping.SlideNumber.toString() in SpecialSlides){
                slideMapping = Object.assign(slideMapping, SpecialSlides[this.dataStore.FacilitatorState.SlideNumber.toString()])
                if (slideMapping.SlideFeedback && !this.dataStore.FacilitatorState.Game.CurrentRound.SlideFeedback) {
                    this.getChartingScores();
                }
            } else {
                this.dataStore.FacilitatorState.CumulativeScores = null;
                this.dataStore.FacilitatorState.RoundScores = null;
            }


            this.dataStore.FacilitatorState.Game.CurrentRound = slideMapping;

            

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
            this.dataStore.FacilitatorState.Scores = r;
            this.dataStore.FacilitatorState.RoundScores = this.getRoundRanking(r);
            this.dataStore.FacilitatorState.CumulativeScores = this.getCumulativeTeamScores(r);
        })
    }


    getRoundRanking(scores: SubRoundScore[]) {
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

        return selectedRoundScores.reverse().slice(0, this.dataStore.FacilitatorState.CurrentLookup.RoundScoreIdx);
      }

      getCumulativeTeamScores(scores: SubRoundScore[]) {
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

        return sortBy(accumulatedScores, "NormalizedScore").reverse().slice(0, this.dataStore.FacilitatorState.CurrentLookup.CumulativeScoreIdx);
      }
}