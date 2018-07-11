import * as React from "react";
import { RouteComponentProps, withRouter} from "react-router";
import AdminCtrl from './AdminCtrl';

class DefaultAdmin extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: AdminCtrl = AdminCtrl.GetInstance(this);

    public static CLASS_NAME = "DefaultAdmin";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
        this.state = this.controller.dataStore;
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
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        return <>
            {this.state.CurrentUser && <h2>Welcome, {this.state.CurrentUser.FirstName}</h2>}
            {!this.state.CurrentUser && <h2>YO</h2>}
        </>;
    }

}

export default withRouter(DefaultAdmin);