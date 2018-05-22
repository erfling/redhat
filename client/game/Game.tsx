import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import Round1 from './PeopleRound';
export default class Game extends React.Component<any, GameModel>
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

    constructor() {
        super({});

        this.state = new GameCtrl(this).dataStore;
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

    render() {
        const Rnd = this.state.RoundsFistma.currentState;
        return  <div>
                    <h1>Check this out, {this.state.Name}</h1>
                    <br />
                    {this.state.Misc}
                    <br />
                    {this.state.Butt}
                    <br />
                    {this.state.DeepObj.depth1.depth2.depth3.msg}
                    <br />
                    {this.state.NoInitValue}
                    <br />
                    <Rnd/>
                    <br />
                    <br />
                    {Object.keys(this.state.RoundsFistma.states)}
                </div>
    }

}
