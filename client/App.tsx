import * as React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Sidebar, Menu } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { RouteComponentProps, withRouter} from "react-router";


class App extends React.Component<RouteComponentProps<any>, any>
{

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: ApplicationCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //------
    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.controller = new ApplicationCtrl(this);
        this.state = this.controller.dataStore;
    }

    render() {
        const ComponentFromState = this.controller.dataStore.ComponentsFistma.currentState
        return <>
            <Sidebar
                as={Menu}
                animation='uncover'
                width='thin'
                visible={true}
                vertical
            >
                <Menu.Item name='home'>
                    Manage Users
                    </Menu.Item>
                <Menu.Item name='home'>
                    Manage Games
                    </Menu.Item>
                <Menu.Item name='home'>
                    <Link to="/game">Edit Game Content</Link>
                </Menu.Item>
            </Sidebar>
            <ComponentFromState />
            </>
    }
}
//            <Login/>
export default withRouter(App)