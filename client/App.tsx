import * as React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Sidebar, Menu, Segment, Button, Icon } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { RouteComponentProps, withRouter } from "react-router";
import { RoleName } from '../shared/models/UserModel'
import DecisionIcon from '-!svg-react-loader?name=Icon!./img/decisions.svg';
import ICommonComponentState from '../shared/base-sapien/client/ICommonComponentState'
import ApplicationViewModel from '../shared/models/ApplicationViewModel'

class App extends React.Component<RouteComponentProps<any>, ApplicationViewModel & ICommonComponentState & { ShowMenu: boolean }>
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
        console.log("DATA STORE: ", this.controller.dataStore)
        this.state = this.controller.dataStore;
    }

    render() {
        if (this.state && this.state.ComponentFistma) {
            const ComponentFromState: any = this.state.ComponentFistma.currentState
            return <>
                {this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN &&

                    <Menu
                        fixed="top"
                        borderless
                        style={{
                            flexShrink: 0, //don't allow flexbox to shrink it
                            borderRadius: 0, //clear semantic-ui style
                            margin: 0 //clear semantic-ui style
                        }}>
                        <Menu.Item>
                            <Icon
                                name={this.state.ShowMenu ? 'cancel' : 'bars'}
                                onClick={e => this.controller.dataStore.ShowMenu = !this.controller.dataStore.ShowMenu}
                            />
                        </Menu.Item>
                        <Menu.Item 
                            onClick={e => this.controller.signOut()}
                            position="right" header>
                            Sign Out
                        </Menu.Item>
                    </Menu>
                }
                <Sidebar.Pushable
                    style={{ height: '100vh' }}
                >
                    {this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN &&
                        <>
                            <Sidebar
                                as={Menu}
                                animation='overlay'
                                width='thin'
                                visible={this.state.ShowMenu}
                                vertical
                                inverted
                                className="admin-sidebar"
                            >
                                <Menu.Item/>
                                <Menu.Item/>
                                <Menu.Item>
                                    <Menu.Header>Administer</Menu.Header>
                                    <Menu.Menu>
                                        <Menu.Item
                                            name='Manage Users'
                                            onClick={e => {
                                                e.preventDefault();
                                                this.controller.navigateOnClick("/admin/userlist")
                                            }}
                                        />
                                        <Menu.Item
                                            name='Manage Games'
                                            onClick={e => {
                                                e.preventDefault();
                                                this.controller.navigateOnClick("/admin/gamelist")
                                            }}
                                        />
                                        <Menu.Item
                                            name='Edit Game Content'
                                            onClick={e => {
                                                e.preventDefault();
                                                this.controller.navigateOnClick("/game")
                                            }}
                                        />
                                    </Menu.Menu>
                                </Menu.Item>

                            </Sidebar>


                        </>

                    }

                    <Sidebar.Pusher
                        className={"source-stream" + (this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN ? " admin-body" : "")}
                    >
                        <ComponentFromState />
                    </Sidebar.Pusher>
                </Sidebar.Pushable>

            </>
        } else if (!this.state) {
            return <h2>Loading</h2>
        } else {
            return <pre>{JSON.stringify(this.state, null, 2)}</pre>
        }
    }
}

export default withRouter(App)
/**{this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN &&
                    
                } */