import * as React from "react";
import FiStMa from '../../shared/FiStMa';
import GameCtrl from "../game/GameCtrl";

export default class Admin extends React.Component<{GameCtrl: GameCtrl}, any>
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
        setTimeout(() => {
            console.log(this.props.GameCtrl);
        }, 3000);

        return  <h1>You are in Admin.</h1>;
    }

}