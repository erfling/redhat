import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameCtrl from "../game/GameCtrl";
import { RouteComponentProps, withRouter } from "react-router";

class Admin extends React.Component<RouteComponentProps<any>, any>
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

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
    }

    componentWillMount() {
        this.props.history.push("/" + this.constructor.name.toLowerCase());
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
        return  <h1>You are in Admin.</h1>;
    }

}

export default withRouter(Admin);