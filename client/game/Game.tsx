'use strict';
import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import { Grid, Menu, Button, Segment, Header } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { Route, Switch, Redirect } from 'react-router';
import Circles from '-!svg-react-loader?name=Icon!../img/circles.svg';
import { IControllerDataStore } from '../../shared/base-sapien/client/BaseClientCtrl';
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import Info from '-!svg-react-loader?name=Icon!../img/info.svg';
import Decisions from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import MessageList from './MessageList'
import IntroLogo from '-!svg-react-loader?name=Icon!../img/intro-logo.svg';
import PeopleRound from "./PeopleRound/PeopleRound";
import Welcome from "./Welcome/Welcome";
import SalesRound from "./SalesRound/SalesRound";
import FinanceRound from "./FinanceRound/FinanceRound";
import EngineeringRound from "./EngineeringRound/EngineeringRound";
import CustomerRound from "./CustomerRound/CustomerRound";
import ApplicationCtrl from "../ApplicationCtrl";
import DataStore from "../../shared/base-sapien/client/DataStore";

export default class Game extends BaseComponent<any, IControllerDataStore & { Game: GameModel } & { _mobileWidth: boolean }>
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
        if(this.controller.ChildController)
            this.controller.dataStore.ApplicationState.MobileWidth = this.controller.ChildController.dataStore.ApplicationState.MobileWidth = window.outerWidth < 767;
        
        document.body.addEventListener("click", (e) => {

            var classes = [];
            var a = e.target as HTMLElement;
            while (a) {
                if(a.classList)classes = classes.concat(a.classList.toString().split(" "));
                a = a.parentNode as HTMLElement;
            }


            if(classes.indexOf("decisions") == -1 && classes.indexOf("mobile-messages") == -1 && classes.indexOf("message-list") == -1 && classes.indexOf("game-nav") == -1){
                this.controller.ChildController.dataStore.ApplicationState.ShowQuestions = false;
                DataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ApplicationState.ShowMessageList = ApplicationCtrl.GetInstance().dataStore.ApplicationState.ShowMessageList = false;
                this._toggleBodyScroll()

            }
        })
        
    }

    private _toggleBodyScroll(){
        //why dont this work?
        console.log("calling this")
        if (this.state.ApplicationState.MobileWidth){ 
            setTimeout(() => {
                document.body.style.overflow = (this.state.ApplicationState.MobileWidth && (this.state.ApplicationState.ShowQuestions || this.state.ApplicationState.ShowMessageList)) ? "hidden" : "auto";
            },20)
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

                <Menu.Item
                    header>
                    <Info
                        onClick={e => {
                            this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList;
                                this._toggleBodyScroll()
                                
                            }
                        }
                    />
                </Menu.Item>
                <Menu.Item
                    header>
                    <Inbox
                        onClick={e => {
                                this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList;
                                this._toggleBodyScroll();

                            }
                        }
                    />
                </Menu.Item>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER &&
                    <Menu.Item
                        header>
                        <Decisions
                            style={{marginTop: '-9px'}}
                            onClick={e => {
                                    this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                                    this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList;
                                    this._toggleBodyScroll();

                                    
                                }
                            }
                        />
                    </Menu.Item>
                }
            </Menu>
        }

        return <Grid.Column
            width={4}
            style={{ position: 'relative', paddingLeft:0 }}
            stretched
        >
            <Menu
                fluid
                vertical
                tabular='right'
                className="game-nav side"
                attached="bottom"
            >

                <Menu.Item
                    onClick={e => {
                        var test = !this.controller.dataStore.ApplicationState.ShowMessageList;  
                        this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                        this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = test;
                        this._toggleBodyScroll()

                    }}
                >
                    <Info
                        className="ui circular image"
                    />
                    <strong>Game Info</strong>
                </Menu.Item>
                <Menu.Item
                    active={this.controller.dataStore.ApplicationState.ShowMessageList}
                    onClick={e => {
                            var test = !this.controller.dataStore.ApplicationState.ShowMessageList;
                            this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = false;
                            this.controller.dataStore.ApplicationState.ShowMessageList = this.controller.ChildController.dataStore.ShowMessageList = test;
                            this._toggleBodyScroll()
                        }}
                    >
                    <Inbox
                        className="ui circular image"
                    />
                    <strong>Inbox</strong>
                </Menu.Item>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER &&
                    <Menu.Item
                        active={this.controller.dataStore.ApplicationState.ShowQuestions}
                        onClick={e => {
                            this.controller.dataStore.ApplicationState.ShowMessageList = false;
                            this.controller.dataStore.ApplicationState.ShowQuestions = this.controller.ChildController.dataStore.ShowQuestions = !this.controller.dataStore.ApplicationState.ShowQuestions;
                            this._toggleBodyScroll()
                        }}
                    >
                        <Decisions
                            className="ui circular image"
                        />
                        <strong>Decisions</strong>
                    </Menu.Item>
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
                        width: '380px'
                    }}
                />
                <Circles
                    style={{
                        position: 'fixed',
                        bottom: '-250px',
                        left: '-280px',
                        width: '570px'
                    }}
                />
                <Column mobile={16} tablet={16} computer={10} largeScreen={8}>
                    <Grid>
                            {location.pathname.toUpperCase().indexOf("WELCOME") == -1 &&
                                <Column
                                    width={16}                                
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
                                        padding:0
                                    }}
                                >
                                    <MessageList
                                        Messages={this.state.ApplicationState.CurrentMessages}
                                        Show={this.state.ApplicationState.ShowMessageList}
                                        SelectFunc={(m) => {
                                            this.controller.dataStore.ApplicationState.ShowMessageList = false;
                                            this.controller.dataStore.ApplicationState.SelectedMessage = m;
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
                                <Redirect exact from="/game" to="/game/welcome/intro"/>
                            </Switch>
                            
                        </Column>
                        {locality.indexOf("WELCOME") == -1 && this.renderGameMenu()}
                    </Grid>
                </Column>
                {this.state.ApplicationState.CurrentMessages && this.state.ApplicationState.MobileWidth && < div
                    className={"mobile-messages" + " " + (this.state.ApplicationState.ShowMessageList ? "show" : "hide")}
                >
                    <MessageList
                        Messages={this.state.ApplicationState.CurrentMessages}
                        Show={this.state.ApplicationState.ShowMessageList}
                        SelectFunc={(m) => {
                            this.controller.dataStore.ApplicationState.ShowMessageList = false;
                            this.controller.dataStore.ApplicationState.SelectedMessage = this.controller.ChildController.dataStore.SelectedMessage = m;
                            console.log("CHILD CONTROLLER ON MESSAGE SELECT", this.controller.ChildController);

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
