import * as React from "react";
import Round1Ctrl from "./PeopleRoundCtrl";
import RoundModel from "../../shared/models/RoundModel";

export default class PeopleRound extends React.Component<{}, RoundModel>
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

        this.state = new Round1Ctrl(this).dataStore;
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
        return  <div>
                    <h1>You are in round 1.</h1>
                    <button>Hit me</button>
                </div>;
    }

}