import * as React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Sidebar, Menu, Segment, Button } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { RouteComponentProps, withRouter } from "react-router";
import { RoleName } from '../shared/models/UserModel'
import DecisionIcon from '-!svg-react-loader?name=Icon!./img/decisions.svg';
import ICommonComponentState from '../shared/base-sapien/client/ICommonComponentState'
import ApplicationViewModel from '../shared/models/ApplicationViewModel'

class App extends React.Component<RouteComponentProps<any>, ApplicationViewModel & ICommonComponentState & {ShowMenu: boolean}>
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
                    <>
                        <Sidebar
                            as={Menu}
                            animation='overlay'
                            width='thin'
                            visible={this.state.ShowMenu}
                            vertical
                            inverted
                        >
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
                        
                        <Button
                                icon={this.state.ShowMenu ? 'cancel' : 'bars'}
                                className="right attached ui button"
                                color="black"
                                style={{
                                    marginLeft: this.state.ShowMenu ? '150px' : '0',
                                    position: 'fixed',
                                    zIndex: '999',
                                    opacity:.6,
                                    transition:'margin-left .5s ease'
                                }}
                                onClick={e => this.controller.dataStore.ShowMenu = !this.controller.dataStore.ShowMenu}
                            >
                            </Button>
                        </>
                        
                    }

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

export default withRouter(App)
/**{this.state && this.controller.CurrentUser && this.controller.CurrentUser.Role == RoleName.ADMIN &&
                    
                } */