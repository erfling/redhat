import * as React from "react";
import CustomerRoundCtrl from "./CustomerRoundCtrl";
import RoundModel from "../../shared/models/RoundModel";

export default class CustomerRound extends React.Component<{}, RoundModel>
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

    constructor(props: {}) {
        super(props);

        this.state = new CustomerRoundCtrl(this).dataStore;
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