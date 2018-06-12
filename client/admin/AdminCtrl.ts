import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import BaseController from "../../shared/entity-of-the-state/BaseController";
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../../api/SchemaBuilder';
import Game from '../game/Game';
import Admin from './Admin';
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';

export default class AdminCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private readonly ComponentStates = {
        game: Game,
        users: Game,
        admin: Admin
    };

    component: any;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super(new AdminViewModel(), reactComp);

        var componentsFistma = this.dataStore.ComponentsFistma = new FiStMa(this.ComponentStates, this.ComponentStates.users);
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

    UrlToComponent(url: string): any {
        console.log("LOOKIN TO PARSE US SOME URLS: ",url)
        for (var prop in this.ComponentStates){
            console.log(prop, (this.ComponentStates as any)[prop].WrappedComponent.name);
            if( url.toUpperCase().indexOf('/' + (this.ComponentStates as any)[prop].WrappedComponent.name.toUpperCase() + '/') != -1 ) {
                console.log("FOUND A MATCH FOR " + (this.ComponentStates as any)[prop].WrappedComponent.name);
                return (this.ComponentStates as any)[prop];
            }
        }

        return null;
    }

}