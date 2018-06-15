import * as React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Sidebar, Menu, Segment } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { RouteComponentProps, withRouter } from "react-router";
import { RoleName } from '../shared/models/UserModel'
import DecisionIcon from '-!svg-react-loader?name=Icon!./img/decisions.svg';
import ICommonComponentState from '../shared/base-sapien/client/ICommonComponentState'
import ApplicationViewModel from '../shared/models/ApplicationViewModel'

class App extends React.Component<RouteComponentProps<any>, ApplicationViewModel & ICommonComponentState>
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
        console.log("DATA STORE: ",this.controller.dataStore)
        this.state = this.controller.dataStore;
    }

    render() {
        if (this.state && this.state.ComponentFistma) {
            const ComponentFromState: any = this.state.ComponentFistma.currentState
            return <>
                <Sidebar.Pushable
                    style={{ height: '100vh' }}
                >
                    {this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN &&
                        <Sidebar
                            as={Menu}
                            animation='uncover'
                            width='thin'
                            visible={true}
                            vertical
                        >
                            {ComponentFromState && ComponentFromState.WrappedComponent.name}
                            <Menu.Item name='home'>
                                Manage Users
                            <DecisionIcon height={20} />
                            </Menu.Item>
                            <Menu.Item name='home'>
                                <a onClick={e => {
                                    e.preventDefault();
                                    this.controller.navigateOnClick("/admin/gamelist")
                                }}>Manage Games</a>
                            </Menu.Item>
                            <Menu.Item name='home'>
                                <a onClick={e => {
                                    e.preventDefault();
                                    this.controller.navigateOnClick("/game")
                                }}>Edit Game Content</a>
                            </Menu.Item>
                        </Sidebar>}
                    <Sidebar.Pusher
                        className="source-stream"
                    >
                        <ComponentFromState />
                    </Sidebar.Pusher>
                </Sidebar.Pushable>

            </>
        } else if(!this.state) {
            return <h2>Loading</h2>
        } else {
            return <pre>{JSON.stringify(this.state, null, 2)}</pre>
        }
    }
}
//            <Login/>
export default withRouter(App)