import * as React from "react";
import { Sidebar, Menu, Button, Icon, Popup } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { RouteComponentProps, withRouter } from "react-router";
import DataStore from '../shared/base-sapien/client/DataStore'
import SapienToast from '../shared/base-sapien/client/shared-components/SapienToast'
import GameCtrl from "./game/GameCtrl";
import { IControllerDataStore } from '../shared/base-sapien/client/BaseClientCtrl';
import {RoleName, JobName} from '../shared/models/UserModel';
import PeopleRoundCtrl from './game/PeopleRound/PeopleRoundCtrl'
import WelcomeCtrl from './game/Welcome/WelcomeCtrl'
import EngineeringRoundCtrl from './game/EngineeringRound/EngineeringRoundCtrl'
import MessageList from './game/MessageList'

class App extends React.Component<RouteComponentProps<any>, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "App";

    public static CONTROLLER = ApplicationCtrl;
    
    controller: ApplicationCtrl = ApplicationCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        console.log("DATA STORE: ", this.controller.dataStore)
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
        if (this.state && this.controller.ComponentFistma) {
            const ComponentFromState: any = this.state.ComponentFistma.currentState
            return <>
                {this.state && this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN &&

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
                                name={this.state.ApplicationState.ShowMenu ? 'cancel' : 'bars'}
                                onClick={e => this.controller.dataStore.ApplicationState.ShowMenu = !this.controller.dataStore.ApplicationState.ShowMenu}
                            />
                        </Menu.Item>
                        <Menu.Item
                            position="right" header>
                            {this.state.ApplicationState.CurrentUser.Name}
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
                    {this.state && this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN &&
                        <>
                            <Sidebar
                                as={Menu}
                                animation='overlay'
                                width='thin'
                                visible={this.state.ApplicationState.ShowMenu}
                                vertical
                                inverted
                                className="admin-sidebar"
                            >
                                <Menu.Item />
                                <Menu.Item />
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
                                                DataStore.GamePlay.IsEditing = true;
                                                this.controller.navigateOnClick("/game/welcome")
                                            }}
                                        />
                                    </Menu.Menu>
                                </Menu.Item>

                            </Sidebar>
                        </>

                    }

                    <Sidebar.Pusher
                        className={"source-stream" + (this.state && this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN ? " admin-body" : "")}
                    >   
                        <ComponentFromState />
                    </Sidebar.Pusher>

                </Sidebar.Pushable>
                {ComponentFromState && ComponentFromState.WrappedComponent.CLASS_NAME.toUpperCase() == "GAME" &&
                    <Menu
                        inverted
                        color="blue"
                        fixed="bottom"
                        borderless
                        style={{
                            flexShrink: 0, //don't allow flexbox to shrink it
                            borderRadius: 0, //clear semantic-ui style
                            margin: 0 //clear semantic-ui style
                        }}>
                            <Menu.Item
                                onClick={() => GameCtrl.GetInstance().goBackRound()}
                                header>
                                    BACK
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => GameCtrl.GetInstance().advanceRound()}
                                header>
                                    FORWARD
                            </Menu.Item>
                            <Menu.Item
                                header>
                                     <Popup
                                        className="email-popup"
                                        trigger={<Icon name="mail"/>}
                                        content={
                                            <MessageList
                                                Messages={this.state.ApplicationState.CurrentMessages}
                                                SelectFunc={(m) => {
                                                    (GameCtrl.GetInstance()._getTargetController((GameCtrl.GetInstance().dataStore.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME)  as any).dataStore.SelectedMessage = m;
                                                    console.log("<<<<<<<<<<<<<<<<<<<<CURRENT MESSATE", (GameCtrl.GetInstance().dataStore.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME, (GameCtrl.GetInstance()._getTargetController((GameCtrl.GetInstance().dataStore.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME)  as any).dataStore.SelectedMessage);

                                                }}
                                            />
                                        }
                                        on='click'
                                        position='top center'
                                    />
                            </Menu.Item>
                            <Menu.Item position="right" header>
                                {this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN &&
                                        <>
                                            Current Role: <select
                                                style={{color:'#000'}}
                                                value={this.state.ApplicationState.CurrentUser.Job}
                                                onChange={e => {
                                                    console.log(e.target.value)
                                                    this.setState(Object.assign(this.state, {
                                                        ApplicationState: Object.assign(this.state.ApplicationState, {
                                                            CurrentUser: Object.assign(this.state.ApplicationState.CurrentUser, {Job: e.target.value as JobName})
                                                        })
                                                    }))
                                                    
                                                    GameCtrl.GetInstance().dataStoreChange();
                                                    (GameCtrl.GetInstance()._getTargetController((GameCtrl.GetInstance().dataStore.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME)  as any).getContentBySubRound()
                                                }}
                                            >
                                                {Object.keys(JobName).map(jn => <option style={{color:'#000'}} value={JobName[jn]}>{JobName[jn]}</option>)}
                                            </select>
                                        </>
                                }
                            </Menu.Item>                            
                    </Menu>
                }
                {this.state.ApplicationState.Toasts &&
                    <div className="toast-holder">
                        {this.state.ApplicationState.Toasts.filter(t => !t.Killed).map(t => <SapienToast
                            Toast={t}
                        />)}
                    </div>
                }
            </>
        } else if (!this.state) {
            return <h2>Loading</h2>
        } else {
            return <pre>{JSON.stringify(this.state, null, 2)}</pre>
        }
    }
}

export default withRouter(App)

/**
 *                                        
                        {this.state && this.state.ApplicationState && <pre>{JSON.stringify(this.state.ApplicationState, null, 2)}</pre>}

 */