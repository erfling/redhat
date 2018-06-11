import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import BaseController from "../../shared/entity-of-the-state/BaseController";
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../../api/SchemaBuilder';

export default class BaseAdminCtrl extends BaseController<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    component: any;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super(new AdminViewModel(), reactComp.forceUpdate.bind(reactComp));
        console.log("YO1:", this.dataStore.Name, "why is this undefined?");
        if(!localStorage || !localStorage.getItem("rhjwt")){
            this.component.props.history.push("/login/admin");
        }
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
    }

    public Navigate(round: RoundModel){
        this.dataStore.RoundsFistma.goTo(round);
    }
    
    /**
     * Go to next game round
     * 
     */
    public advanceRound(){
        this.dataStore.RoundsFistma.next();
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){
        this.dataStore.RoundsFistma.previous();
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}