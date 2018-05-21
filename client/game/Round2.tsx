import * as React from "react";
import Round2Ctrl from "./Round2Ctrl";
import RoundModel from "../../shared/models/RoundModel";

export default class Round2 extends React.Component<{}, RoundModel>
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

        this.state = new Round2Ctrl(this).dataStore;
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
                    <h1>You are in round 2.</h1>
                    <button>With yer</button>
                </div>;
    }

}