import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import UserModel from '../../shared/models/UserModel';
import BaseGameCtrl from '../../shared/base-sapien/client/BaseGameCtrl';
import { Component } from 'react';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../../api/SchemaBuilder';

export default class UserManagementCtrl extends BaseGameCtrl<UserModel[]>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {
        super( reactComp );
        console.log("YO1:", this.dataStore.Name, "why is this undefined?");

        this.dataStore.Name = "Some initial value";
        console.log("YO2:", this.dataStore.Name);
        
        console.log("RoundModel SCHEMA:", SchemaBuilder.fetchSchema(RoundModel));
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