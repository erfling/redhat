import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import Game from '../game/Game';
import { Grid, Sidebar, Menu } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter} from "react-router";
import { Route, Link } from "react-router-dom";
import AdminCtrl from './AdminCtrl';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState'
import AdminViewModel from '../../shared/models/AdminViewModel';

class Admin extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: AdminCtrl;

    public static CLASS_NAME = "Admin"


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
        console.log("DB COMPONENT", DashBoardComponent.WrappedComponent.name)
        return <>
            <DashBoardComponent/>
        </>;
    }

}

export default withRouter(Admin);