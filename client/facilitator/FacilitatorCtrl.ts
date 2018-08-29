'use strict';
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameModel from '../../shared/models/GameModel';
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


export default class FacilitatorCtrl extends BaseClientCtrl<IControllerDataStore & {Game: GameModel, _mobileWidth: boolean, ShowGameInfoPopup: boolean, ShowDecisionPopup: boolean, ShowInboxPopup: boolean; GrowMessageIndicator: boolean} & {groupedResponses: any}>
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
        let iframe: HTMLIFrameElement = document.querySelector("#slides-container") as HTMLIFrameElement;
        let src = iframe.getAttribute("src")//.split("slide=")[1];
        let currentSlideNumber = src.split("slide=")[1];
        if(currentSlideNumber){
            let newSlideNumber = Number(currentSlideNumber) + forwardOrBack;
            console.log("Slide number is ", iframe, currentSlideNumber, newSlideNumber);
            iframe.setAttribute("src", src.split("slide=")[0] + "slide=" + newSlideNumber.toString());

            GameCtrl.GetInstance().goToMapping({
                ParentRound: "FinanceRound",
                ChildRound: "AcquisitionStructure"
            })
        }
        
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

   

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
            GrowMessageIndicator: false
        };

        console.log("DATASTORE APPLICATION:", DataStore.ApplicationState);
        //this.pollForGameStateChange(this.dataStore.ApplicationState.CurrentTeam.GameId);
    }

}