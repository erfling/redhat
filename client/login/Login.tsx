import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

class Login extends React.Component<RouteComponentProps<any>, any>
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
        return  <h1>You are in login.</h1>;
    }

}

export default withRouter(Login);