import * as React from "react";
import { Sidebar, Menu, Button, Icon, Popup, MenuItem, Grid } from 'semantic-ui-react';
import ApplicationCtrl from './ApplicationCtrl';
import { Switch, Route, Redirect } from "react-router";
import { Link } from 'react-router-dom';
import SapienToast from '../shared/base-sapien/client/shared-components/SapienToast'
import GameCtrl from "./game/GameCtrl";
import { IControllerDataStore } from '../shared/base-sapien/client/BaseClientCtrl';
import { RoleName, JobName } from '../shared/models/UserModel';
import BaseComponent from "../shared/base-sapien/client/shared-components/BaseComponent";
import BaseRoundCtrl from "../shared/base-sapien/client/BaseRoundCtrl";
import Admin from './admin/Admin';
import Game from "./game/Game";
import Login from "./login/Login";
import SalesRoundCtrl from "./game/SalesRound/SalesRoundCtrl";

export default class App extends BaseComponent<any, IControllerDataStore>
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

    constructor(props: any) {
        super(props);

        this.state = this.controller.dataStore;

        /*
        document.addEventListener("oTransitionEnd", function(e){
            _handleEndTrastion(e);                      
        });

        document.addEventListener("transitionend", function(e){
            _handleEndTrastion(e);                      
        });         

        function _handleEndTrastion(e: Event){
            if((e.target as HTMLElement).classList.contains("wide-messages")){
                console.log(e, (e.target as HTMLElement).classList);
                (e.target as HTMLElement).style.position = (e.target as HTMLElement).classList.contains('hide') ? "fixed" : "relative"
                if((e.target as HTMLElement).classList.contains("decisions")){
                    (e.target as HTMLElement).style.marginTop = (e.target as HTMLElement).classList.contains('hide') ? "0" : "-50px";
                }
            }  
        }
        */
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
        if (this.state) {
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
                <div
                    style={{ height: '100vh' }}
                >
                    {this.state && this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN &&
                        <>
                            <Sidebar
                                as={Menu}
                                animation='overlay'
                                width='wide'
                                visible={this.state.ApplicationState.ShowMenu}
                                vertical
                                inverted
                                fixed="left"
                                className="admin-sidebar"
                                style={{
                                    paddingBottom: '10vh'
                                }}
                            >
                                <Menu.Item>
                                    <Menu.Header>Administer</Menu.Header>
                                    <Menu.Menu>
                                        <Menu.Item
                                            name='Manage Users'
                                        >
                                            <Link to="/admin/userlist">Manage Users</Link>
                                        </Menu.Item>
                                        <Menu.Item
                                            name='Manage Games'
                                        >
                                            <Link to="/admin/gamelist">Manage Games</Link>
                                        </Menu.Item>
                                        <Menu.Item
                                            name='Edit Game Content'
                                        >
                                            <Link to="/game/welcome">Game Content</Link>
                                        </Menu.Item>
                                    </Menu.Menu>
                                </Menu.Item>

                                {this.props.location && this.props.location.pathname.toUpperCase().indexOf("GAME") && <>
                                    <Menu.Item>
                                        <Menu.Item>
                                            <Menu.Item
                                                name='Show Feedback'
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                    GameCtrl.GetInstance().goToMapping({
                                                        ParentRound: GameCtrl.GetInstance().getParentRound(),
                                                        ChildRound: GameCtrl.GetInstance().getChildRound(),
                                                        ShowFeedback: !this.state.ApplicationState.ShowFeedback,
                                                        ShowRateUsers: false
                                                    })
                                                }}
                                            >
                                            </Menu.Item>
                                            <Menu.Item
                                                name='Rate Users'
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                    GameCtrl.GetInstance().goToMapping({
                                                        ParentRound: GameCtrl.GetInstance().getParentRound(),
                                                        ChildRound: GameCtrl.GetInstance().getChildRound(),
                                                        ShowFeedback: false,
                                                        ShowRateUsers: !this.state.ApplicationState.ShowRateUsers
                                                    })
                                                }}
                                            >
                                            </Menu.Item>
                                            <Menu.Item
                                                name='User Ratings'
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                    GameCtrl.GetInstance().goToMapping({
                                                        ParentRound: GameCtrl.GetInstance().getParentRound(),
                                                        ChildRound: GameCtrl.GetInstance().getChildRound(),
                                                        ShowFeedback: false,
                                                        ShowIndividualFeedback: !this.state.ApplicationState.ShowIndividualFeedback
                                                    })
                                                }}
                                            >
                                            </Menu.Item>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Menu.Item>
                                                <Menu.Header>Go to:</Menu.Header>
                                                <Menu.Item
                                                    name='1A'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "peopleround",
                                                            ChildRound: "priorities"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name='1B'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "peopleround",
                                                            ChildRound: "hiring"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                
                                                <Menu.Item
                                                    name='2A'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "SalesRound",
                                                            ChildRound: "DealStructure"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name='2B'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "SalesRound",
                                                            ChildRound: "DealRenewal"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name='3'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "engineeringround",
                                                            ChildRound: "engineeringsub"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name='4A'
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "FinanceRound",
                                                            ChildRound: "Pricing"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name="4B"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "FinanceRound",
                                                            ChildRound: "TeamRating"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name="4C"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "FinanceRound",
                                                            ChildRound: "Bid"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>
                                                <Menu.Item
                                                    name="4D"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "FinanceRound",
                                                            ChildRound: "AcquisitionStructure"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>

                                                <Menu.Item
                                                    name="5"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        this.controller.dataStore.ApplicationState.ShowMenu = false;
                                                        GameCtrl.GetInstance().goToMapping({
                                                            ParentRound: "CustomerRound",
                                                            ChildRound: "CustomerSub"
                                                        })
                                                    }}
                                                >
                                                </Menu.Item>

                                            </Menu.Item>
                                        </Menu.Item>


                                    </Menu.Item>
                                    <Menu.Item>
                                        <Menu.Header>Play As</Menu.Header>
                                        <Menu.Item>
                                            <MenuItem
                                                name={JobName.IC}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;

                                                    this.setState(Object.assign(this.state, {
                                                        ApplicationState: Object.assign(this.state.ApplicationState, {
                                                            CurrentUser: Object.assign(this.state.ApplicationState.CurrentUser, { Job: JobName.IC })
                                                        })
                                                    }))
                                                    GameCtrl.GetInstance().LockedInJob = JobName.IC;

                                                    GameCtrl.GetInstance().dataStoreChange();
                                                    (GameCtrl.GetInstance().ChildController as BaseRoundCtrl<any>).getContentBySubRound();
                                                    //(GameCtrl.GetInstance()._getTargetController((GameCtrl.GetInstance().dataStore.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME) as any).getContentBySubRound()
                                                }}
                                            />
                                            <MenuItem
                                                name={JobName.MANAGER}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;

                                                    this.setState(Object.assign(this.state, {
                                                        ApplicationState: Object.assign(this.state.ApplicationState, {
                                                            CurrentUser: Object.assign(this.state.ApplicationState.CurrentUser, { Job: JobName.MANAGER })
                                                        })
                                                    }))
                                                    GameCtrl.GetInstance().LockedInJob = JobName.MANAGER;

                                                    console.log("BASE CONTROLLER IN APP IS:", (GameCtrl.GetInstance().ChildController as BaseRoundCtrl<any>))

                                                    GameCtrl.GetInstance().dataStoreChange();
                                                    (GameCtrl.GetInstance().ChildController as BaseRoundCtrl<any>).getContentBySubRound();

                                                }}
                                            />
                                            <MenuItem
                                                name={JobName.CHIPCO}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    this.controller.dataStore.ApplicationState.ShowMenu = false;

                                                    this.setState(Object.assign(this.state, {
                                                        ApplicationState: Object.assign(this.state.ApplicationState, {
                                                            CurrentUser: Object.assign(this.state.ApplicationState.CurrentUser, { Job: JobName.CHIPCO })
                                                        })
                                                    }))
                                                    GameCtrl.GetInstance().LockedInJob = JobName.CHIPCO;

                                                    GameCtrl.GetInstance().dataStoreChange();
                                                    (GameCtrl.GetInstance().ChildController as BaseRoundCtrl<any>).getContentBySubRound();

                                                }}
                                            />
                                            <MenuItem
                                                name={JobName.INTEGRATED_SYSTEMS}
                                                onClick={e => {
                                                    e.preventDefault();

                                                    this.setState(Object.assign(this.state, {
                                                        ApplicationState: Object.assign(this.state.ApplicationState, {
                                                            CurrentUser: Object.assign(this.state.ApplicationState.CurrentUser, { Job: JobName.INTEGRATED_SYSTEMS })
                                                        })
                                                    }))
                                                    GameCtrl.GetInstance().LockedInJob = JobName.INTEGRATED_SYSTEMS;
                                                    GameCtrl.GetInstance().dataStoreChange();
                                                    (GameCtrl.GetInstance().ChildController as BaseRoundCtrl<any>).getContentBySubRound();

                                                }}
                                            />
                                        </Menu.Item>
                                    </Menu.Item>
                                </>
                                }

                            </Sidebar>
                        </>

                    }
                    <div
                        className={"source-stream " + (this.state && this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN ? " admin-body " : " ") + (this.state.ApplicationState.MobileWidth ? "mobile" : "")}
                        
                    >
                        <Switch>
                            <Redirect exact from="/" to="/game" />
                            <Route path="/game" component={Game} />
                            <Route path="/login" component={Login} />
                            <Route path="/admin" component={Admin} />
                        </Switch>
                    </div>

                </div>

                {this.state.ApplicationState.Toasts &&
                    <div className="toast-holder">
                        {this.state.ApplicationState.Toasts.filter(t => !t.Killed).map((t, i) => <SapienToast
                            key={i}
                            Toast={t}
                        />)}
                    </div>
                }

            </>
        } else if (!this.state) {
            return <h2>Loading</h2>
        } else {
            return <pre>hey {JSON.stringify(this.state, null, 2)}</pre>
        }
    }
}
/**
 *          
                        {this.state && this.state.ApplicationState && <pre>{JSON.stringify(this.state.ApplicationState, null, 2)}</pre>}

 */