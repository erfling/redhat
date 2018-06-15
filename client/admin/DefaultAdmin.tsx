import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Grid, Menu } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter} from "react-router";
import AdminCtrl from './AdminCtrl';

class DefaultAdmin extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: AdminCtrl;



    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.controller = new AdminCtrl(this);
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
        const DashBoardComponent = this.state.ComponentFistma.currentState;
        return <>
            {this.state.CurrentUser && <h2>Welcome, {this.state.CurrentUser.FirstName}</h2>}
            {!this.state.CurrentUser && <h2>YO</h2>}
        </>;
    }

}

export default withRouter(DefaultAdmin);