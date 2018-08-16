'use strict';
import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import UserModel, { JobName, RoleName } from "../../shared/models/UserModel";
import { Grid, Menu, Button, Segment, Header, Popup, Label } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { Route, Switch, Redirect } from 'react-router';
import Circles from '-!svg-react-loader?name=Icon!../img/circles-blue.svg';
import { IControllerDataStore } from '../../shared/base-sapien/client/BaseClientCtrl';
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import Info from '-!svg-react-loader?name=Icon!../img/info.svg';
import Rubiks from '-!svg-react-loader?name=Icon!../img/Problem_Based_Learning.svg';
import Decisions from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import MessageList from './MessageList';
import IntroLogo from '-!svg-react-loader?name=Icon!../img/intro-logo-blue-circles.svg';
import PeopleRound from "./PeopleRound/PeopleRound";
import Welcome from "./Welcome/Welcome";
import SalesRound from "./SalesRound/SalesRound";
import FinanceRound from "./FinanceRound/FinanceRound";
import EngineeringRound from "./EngineeringRound/EngineeringRound";
import CustomerRound from "./CustomerRound/CustomerRound";
import ApplicationCtrl from "../ApplicationCtrl";
import DataStore from "../../shared/base-sapien/client/DataStore";

export default class Game extends BaseComponent<any, IControllerDataStore & { Game: GameModel, _mobileWidth: boolean, ShowGameInfoPopup: boolean, ShowDecisionPopup: boolean, ShowInboxPopup: boolean; GrowMessageIndicator: boolean }>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Game";

    public static CONTROLLER = GameCtrl;

    controller: GameCtrl = GameCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.state = this.controller.dataStore;
        document.getElementsByTagName('meta')["viewport"].content = "width=device-width, initial-scale=1.0, maximum-scale=1";
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

    componentDidMount() {
        super.componentDidMount();
        if (this.props.location.search) {
            console.log("FOUND LOCATION SEARCH", this.props.location.search);
        }

        this._updateDimensionsAndHandleClickOff();
        window.addEventListener("resize", this._updateDimensionsAndHandleClickOff.bind(this));
    }

    /**
    * Calculate & Update state of new dimensions
    */
    private _updateDimensionsAndHandleClickOff() {
        if (this.controller.ChildController)
            this.controller.dataStore.ApplicationState.MobileWidth = this.controller.ChildController.dataStore.ApplicationState.MobileWidth = window.outerWidth < 767;

        document.body.addEventListener("click", (e) => {

            var classes = [];
            var a = e.target as HTMLElement;
            while (a) {
                if (a.classList) classes = classes.concat(a.classList.toString().split(" "));
                a = a.parentNode as HTMLElement;
            }


            if (classes.indexOf("toast-holder") == -1 && classes.indexOf("decisions") == -1 && classes.indexOf("mobile-messages") == -1 && classes.indexOf("message-list") == -1 && classes.indexOf("game-nav") == -1) {
                this.controller.ChildController.dataStore.ApplicationState.ShowMessageList = false;
                DataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ApplicationState.ShowQuestions = ApplicationCtrl.GetInstance().dataStore.ApplicationState.ShowQuestions = false;
                this._toggleBodyScroll()

            }
        })

    }

    private _toggleBodyScroll() {
        //why dont this work?
        if (this.state.ApplicationState.MobileWidth) {
            setTimeout(() => {
                document.body.style.overflow = (this.state.ApplicationState.MobileWidth && (this.state.ApplicationState.ShowQuestions || this.state.ApplicationState.ShowMessageList)) ? "hidden" : "auto";
            }, 20)
        }
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this._updateDimensionsAndHandleClickOff.bind(this));
        window.removeEventListener("click", this._updateDimensionsAndHandleClickOff.bind(this));
    }

    renderGameMenu() {
        if (this.state.ApplicationState.MobileWidth) {
            return <Menu
                widths={this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER ? 3 : 2}
                color="blue"
                fixed="top"
                className="game-nav"
                borderless
                inverted
                style={{
                    zIndex: 10001,
                    flexShrink: 0, //don't allow flexbox to shrink it
                    borderRadius: 0, //clear semantic-ui style
                    margin: 0 //clear semantic-ui style
                }}>

                <Popup
                    trigger={
                        <Menu.Item
                            style={{ position: 'relative' }}
                            onClick={e => {
                                this.controller.viewDefaultMessage();
                                this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = false;
                                this.controller.ChildController.dataStore.ShowQuestions = false;
                                window.scrollTo(0, 0);
                                this._toggleBodyScroll();
                            }}
                        >
                            <Rubiks
                                className="ui circular image"
                            />
                        </Menu.Item>
                    }
                    open={this.state.ShowGameInfoPopup}
                    position='bottom right'
                    className="nav-instruction"                    
                    style={{
                        marginLeft:'40px'
                    }}
                >

                    <div className="dismiss-header"
                        onClick={(e) => {
                            e.preventDefault();
                            this.controller.dataStore.ShowGameInfoPopup = false
                            this.controller.dataStore.ShowInboxPopup = true;
                        }}
                    >
                        x
                    </div>
                    View Your Challenge
                </Popup>

                <Popup
                    trigger={
                        <Menu.Item
                            active={this.controller.dataStore.ApplicationState.ShowMessageList}
                            onClick={e => {
                                var test = !this.controller.dataStore.ApplicationState.ShowMessageList;
                                this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = test;
                                this._toggleBodyScroll();
                                window.scrollTo(0, 0);

                            }}
                        >
                            <Inbox
                                className="ui circular image"
                            />
                            <strong>
                                {this.state.ApplicationState.UnreadMessages > 0 &&
                                    <Label circular
                                        size="large"
                                        className={"message-indicator" + (this.state.GrowMessageIndicator ? " grow" : "")}
                                        style={{
                                            marginLeft: "8px",
                                            background: '#f5fafc',
                                            color: '#db2828',
                                        }}
                                        content={this.state.ApplicationState.UnreadMessages}
                                    />
                                }
                            </strong>
                        </Menu.Item>
                    }
                    open={this.state.ShowInboxPopup}
                    position='bottom center'
                    className="nav-instruction"
                >
                    <div className="dismiss-header"

                        onClick={(e) => {
                            e.preventDefault();
                            this.controller.dataStore.ShowInboxPopup = false;
                            this.controller.dataStore.ShowDecisionPopup = true;
                        }}
                    >
                        x
                    </div>
                    Check for important new messages.
                </Popup>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER &&
                
                    <Popup
                        trigger={
                            <Menu.Item
                                active={this.controller.dataStore.ApplicationState.ShowQuestions}
                                onClick={e => {
                                    this.controller.dataStore.ApplicationState.ShowMessageList = false;
                                    this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = !this.controller.dataStore.ApplicationState.ShowQuestions;
                                    //this._toggleBodyScroll();
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <Decisions
                                    className="ui circular image"
                                />
                            </Menu.Item>}
                        open={this.state.ShowDecisionPopup}
                        position="bottom right"
                        className="nav-instruction top-nav-last bottom left"
                    >
                        <div className="dismiss-header"

                            onClick={(e) => {
                                e.preventDefault();
                                this.controller.dataStore.ShowDecisionPopup = false;
                            }}
                        >
                            x
                    </div>
                        As manager, you enter decisions for your team.
                </Popup>
                
                }
            </Menu>
        }

        return <Grid.Column
            width={4}
            style={{ position: 'relative', paddingLeft: 0 }}
            stretched
        >
            <Menu
                fluid
                vertical
                tabular='right'
                className="game-nav side"
                attached="bottom"
            >
                <Popup
                    trigger={
                        <Menu.Item
                            style={{ position: 'relative' }}
                            onClick={e => {
                                this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = false;
                                this.controller.viewDefaultMessage();
                                this.controller.ChildController.dataStore.ShowQuestions = false;
                                //this._toggleBodyScroll();
                                window.scrollTo(0, 0);
                            }}
                        >
                            <Rubiks
                                style={{
                                    background: '#0087b9',
                                    fill: "white"
                                }}
                                className="ui circular image"
                            />
                            <strong>Challenge</strong>
                        </Menu.Item>
                    }
                    open={this.state.ShowGameInfoPopup}
                    position='left center'
                    className="nav-instruction side"
                >

                    <div className="dismiss-header"
                        onClick={(e) => {
                            e.preventDefault();
                            this.controller.dataStore.ShowGameInfoPopup = false
                            this.controller.dataStore.ShowInboxPopup = true;
                        }}
                    >
                        x
                    </div>
                    View Your Challenge
                </Popup>

                <Popup
                    trigger={
                        <Menu.Item
                            active={this.controller.dataStore.ApplicationState.ShowMessageList}
                            onClick={e => {
                                var test = !this.controller.dataStore.ApplicationState.ShowMessageList;
                                this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = test;
                                //this._toggleBodyScroll();
                                window.scrollTo(0, 0);

                            }}
                        >
                            <Inbox
                                className="ui circular image"
                            />
                            <strong>
                                Inbox
                                {this.state.ApplicationState.UnreadMessages > 0 &&
                                    <Label circular
                                        size="large"
                                        className={"message-indicator" + (this.state.GrowMessageIndicator ? " grow" : "")}
                                        style={{
                                            marginLeft: "8px",
                                            background: '#f5fafc',
                                            color: '#db2828',
                                        }}
                                        content={this.state.ApplicationState.UnreadMessages}
                                    />
                                }
                            </strong>
                        </Menu.Item>
                    }
                    open={this.state.ShowInboxPopup}
                    position='left center'
                    className="nav-instruction side sapien-toast"
                >
                    <div className="dismiss-header"

                        onClick={(e) => {
                            e.preventDefault();
                            this.controller.dataStore.ShowInboxPopup = false;
                            this.controller.dataStore.ShowDecisionPopup = true;
                        }}
                    >
                        x
                    </div>
                    Check for important new messages.
                </Popup>

                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER &&
                    <Popup
                        trigger={
                            <Menu.Item
                                active={this.controller.dataStore.ApplicationState.ShowQuestions}
                                onClick={e => {
                                    this.controller.dataStore.ApplicationState.ShowMessageList = false;
                                    this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = !this.controller.dataStore.ApplicationState.ShowQuestions;
                                    //this._toggleBodyScroll();
                                    window.scrollTo(0, 0);

                                }}
                            >
                                <Decisions
                                    className="ui circular image"
                                />
                                <strong>Decisions</strong>
                            </Menu.Item>}
                        open={this.state.ShowDecisionPopup}
                        position='left center'
                        className="nav-instruction side"
                    >
                        <div className="dismiss-header"

                            onClick={(e) => {
                                e.preventDefault();
                                this.controller.dataStore.ShowDecisionPopup = false;
                            }}
                        >
                            x
                        </div>
                        As manager, you enter decisions for your team.
                    </Popup>
                }

            </Menu>
        </Grid.Column>
    }

    render() {
        const locality = this.props.location ? this.props.location.pathname.toUpperCase() : "";

        if (this.state) {
            return <Grid
                columns={16}
                className="game-wrapper"
                style={{
                    textAlign: 'left',
                    paddingBottom: '50px'
                }}
            >
                <Circles
                    style={{
                        position: 'fixed',
                        bottom: '60px',
                        right: '-210px',
                        width: '380px',
                        opacity: .7
                    }}
                />
                <Circles
                    style={{
                        position: 'fixed',
                        bottom: '-250px',
                        left: '-280px',
                        width: '570px',
                        opacity: .7
                    }}
                />
                <Column mobile={16} tablet={16} computer={12} largeScreen={10}>
                    <Grid>
                        {location.pathname.toUpperCase().indexOf("WELCOME") == -1 &&
                            <Column
                                width={16}
                                style={{
                                    paddingTop: this.state.ApplicationState.MobileWidth ? this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN ? "50px" : "15px" : "0"
                                }}
                            >
                                <IntroLogo
                                    className="top-logo"
                                />
                            </Column>
                        }
                        <Column
                            width={this.state.ApplicationState.MobileWidth ? 16 : 12}
                            style={{
                                paddingRight: !this.state.ApplicationState.MobileWidth && this.state.ApplicationState.ShowMessageList ? 0 : '1rem'
                            }}
                        >
                            {this.state.ApplicationState.CurrentMessages && !this.state.ApplicationState.MobileWidth && <div
                                className={"wide-messages " + (this.state.ApplicationState.ShowMessageList ? "show" : "hide")}
                            >
                                <Segment
                                    style={{
                                        padding: 0,
                                        background: 'transparent'
                                    }}
                                >
                                    <MessageList
                                        Messages={this.state.ApplicationState.CurrentMessages.filter(m => !m.IsDefault).map(m => {
                                            return this.state.ApplicationState.CurrentUser.ReadMessages.indexOf(m._id) == -1 ? Object.assign(m, { IsRead: false }) : Object.assign(m, { IsRead: true });
                                        })}
                                        Show={this.state.ApplicationState.ShowMessageList}
                                        SelectFunc={(m) => {
                                            this.controller.dataStore.ApplicationState.ShowMessageList = false;
                                            this.controller.dataStore.ApplicationState.SelectedMessage = m;
                                            this.controller.ReadMessage(m._id);
                                        }}
                                    />
                                </Segment>
                            </div>
                            }

                            <Switch>
                                <Route path="/game/welcome" component={Welcome} />
                                <Route path="/game/peopleround" component={PeopleRound} />
                                <Route path="/game/engineeringround" component={EngineeringRound} />
                                <Route path="/game/salesround" component={SalesRound} />
                                <Route path="/game/financeround" component={FinanceRound} />
                                <Route path="/game/customerround" component={CustomerRound} />
                                <Redirect exact from="/game" to="/game/welcome/intro" />
                            </Switch>

                        </Column>
                        {locality.indexOf("WELCOME") == -1 && this.renderGameMenu()}
                    </Grid>
                </Column>

                {this.state.ApplicationState.CurrentMessages && this.state.ApplicationState.MobileWidth && < div
                    className={"mobile-messages" + " " + (this.state.ApplicationState.ShowMessageList ? "show" : "hide")}
                >
                    <MessageList
                        Messages={this.state.ApplicationState.CurrentMessages.filter(m => !m.IsDefault).map(m => {
                            return this.state.ApplicationState.CurrentUser.ReadMessages.indexOf(m._id) == -1 ? Object.assign(m, { IsRead: false }) : Object.assign(m, { IsRead: true });
                        })}
                        Show={this.state.ApplicationState.ShowMessageList}
                        SelectFunc={(m) => {
                            this.controller.dataStore.ApplicationState.ShowMessageList = false;
                            this.controller.dataStore.ApplicationState.SelectedMessage = this.controller.ChildController.dataStore.SelectedMessage = m;
                            this.controller.ReadMessage(m._id)
                        }}
                    />
                </div>
                }
            </Grid>

        } else {
            return <Segment loading></Segment>
        }
    }

}
