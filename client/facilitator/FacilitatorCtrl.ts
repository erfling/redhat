'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
import FacilitationRoundResponseMapping from '../../shared/models/FacilitationRoundResponseMapping';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import UserModel, { JobName, RoleName } from '../../shared/models/UserModel';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import BaseClientCtrl, {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import DataStore from '../../shared/base-sapien/client/DataStore';
import TeamModel from '../../shared/models/TeamModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import BaseRoundCtrl from '../../shared/base-sapien/client/BaseRoundCtrl';
import GameCtrl from '../game/GameCtrl';

export interface IFacilitatorDataStore extends IControllerDataStore{
    Game: GameModel;
    _mobileWidth: boolean;
    ShowGameInfoPopup: boolean;
    ShowDecisionPopup: boolean;
    ShowInboxPopup: boolean; 
    GrowMessageIndicator: boolean;
    groupedResponses: any;
    SlideNumber: number;
    RoundChangeLookups: RoundChangeMapping[];
    RoundResponseMappings: FacilitationRoundResponseMapping[];
    AccordionIdx: number,
    FullScreen: boolean
}

export default class FacilitatorCtrl extends BaseClientCtrl<IFacilitatorDataStore>
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
        this.dataStore.SlideNumber = this.dataStore.SlideNumber + forwardOrBack;
       // alert(this.dataStore.SlideNumber);

        let lookups = this.dataStore.RoundChangeLookups.filter(lu => lu.MinSlideNumber == this.dataStore.Game.CurrentRound.SlideNumber);
        

        if (lookups){
            let lookup = lookups[0];
            console.log("LOOKUPS",lookup, this.dataStore.RoundChangeLookups);

            if(lookup){
                let mapping = new RoundChangeMapping();
                mapping.ParentRound = lookup.Round;
                mapping.ChildRound = lookup.SubRound;
                mapping.SlideNumber = this.dataStore.SlideNumber;
                mapping.GameId = this.dataStore.Game._id;

                console.log("GOING TO: ", mapping)

                this.goToMapping(mapping);
            }
        }
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public getRoundInfo(){ 
        return SapienServerCom.GetData(null,  FacilitationRoundResponseMapping, SapienServerCom.BASE_REST_URL + "facilitator/getroundstatus/" + this.dataStore.Game._id).then(rcl => {
            this.dataStore.RoundResponseMappings = rcl as FacilitationRoundResponseMapping[];
            this.dataStore.Game.CurrentRound = (rcl[0] as FacilitationRoundResponseMapping).CurrentRound;
            return rcl;
        })        
    }

    public getLookups(){   
        return SapienServerCom.GetData(null,  RoundChangeMapping, SapienServerCom.BASE_REST_URL + "facilitator/getroundchangelookups").then(rcl => {
            this.dataStore.RoundChangeLookups = rcl as RoundChangeMapping[];
            return rcl;
        })        
    }

    public goToMapping(mapping: Partial<RoundChangeMapping>){
        if ( mapping.ParentRound && mapping.ChildRound ) {
            SapienServerCom.SaveData(mapping, SapienServerCom.BASE_REST_URL + "facilitation/round/" + this.dataStore.ApplicationState.CurrentTeam.GameId).then(r => {
                console.log("RESPONSE FROM SERVER FROM ROUND ADVANCE POST", r)
            });
        }
    }

    public getGame(id: string){
        //alert("getting game " + id)
        return SapienServerCom.GetData(null, GameModel, SapienServerCom.BASE_REST_URL + GameModel.REST_URL + "/" + id).then((g: GameModel) => {
            this.dataStore.Game = g;
            return this.dataStore.Game;
        })
    }

    public gotToSlide(){
        GameCtrl.GetInstance().dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = DataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber 
            = this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber++;

        this.goToMapping(this.dataStore.RoundChangeLookups[this.dataStore.ApplicationState.CurrentGame.CurrentRound.SlideNumber])
    }

    protected _setUpFistma(reactComp: Component) {
       
        DataStore.ApplicationState.CurrentUser = localStorage.getItem("RH_USER") ? Object.assign( new UserModel(), JSON.parse(localStorage.getItem("RH_USER") ) ) : new UserModel();      
        DataStore.ApplicationState.CurrentTeam = localStorage.getItem("RH_TEAM") ? Object.assign( new TeamModel(), JSON.parse(localStorage.getItem("RH_TEAM") ) ) : new TeamModel();

        this.dataStore = {
            ApplicationState: DataStore.ApplicationState,
            ComponentFistma: this.ComponentFistma,
            groupedResponses: null,
            Game: new GameModel(),
            _mobileWidth: window.innerWidth < 767,
            ShowDecisionPopup: false,
            ShowGameInfoPopup: false,
            ShowInboxPopup: false,
            GrowMessageIndicator: false,
            SlideNumber: 1, 
            RoundChangeLookups: [],
            AccordionIdx: 0,
            FullScreen: false,
            RoundResponseMappings: null
        };



        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState, this.component, this.dataStore);
        //this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId);
    }

}