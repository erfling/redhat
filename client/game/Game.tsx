'use strict';
import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import { Grid, Menu, Button, Segment, Header } from 'semantic-ui-react';
const { Row, Column } = Grid;

import { RouteComponentProps, withRouter } from "react-router";
import Circles from '-!svg-react-loader?name=Icon!../img/circles.svg';
import { IControllerDataStore } from '../../shared/base-sapien/client/BaseClientCtrl';
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import Info from '-!svg-react-loader?name=Icon!../img/info.svg';
import Decisions from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import MessageList from './MessageList'
import IntroLogo from '-!svg-react-loader?name=Icon!../img/intro-logo.svg';

class Game extends BaseComponent<RouteComponentProps<any>, IControllerDataStore & { Game: GameModel } & { _mobileWidth: boolean }>
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

    constructor(props: RouteComponentProps<any>) {
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

        this.props.history.push("/game/" + (this.state.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME.toLowerCase());

        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    /**
    * Calculate & Update state of new dimensions
    */
    updateDimensions() {
        console.log("updating dimensions", window.outerWidth,this.controller.ComponentFistma.currentState.WrappedComponent.CLASS_NAME)
        if(this.controller._getTargetController(this.controller.ComponentFistma.currentState.WrappedComponent.CLASS_NAME).dataStore)
            this.controller.dataStore.ApplicationState.MobileWidth = this.controller._getTargetController(this.controller.ComponentFistma.currentState.WrappedComponent.CLASS_NAME).dataStore.ApplicationState.MobileWidth = window.outerWidth < 767
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    renderGameMenu() {
        if (this.state.ApplicationState.MobileWidth) {
            return <Menu
                widths={this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER ? 3 : 2}
                color="blue"
                fixed="bottom"
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
                        onClick={e => this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList}
                    />
                </Menu.Item>
                <Menu.Item
                    header>
                    <Inbox
                        onClick={e => this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList}
                    />
                </Menu.Item>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER &&
                    <Menu.Item
                        header>
                        <Decisions
                            onClick={e => this.controller.dataStore.ApplicationState.ShowQuestions = !this.controller.dataStore.ApplicationState.ShowQuestions}
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
                        this.controller.dataStore.ApplicationState.ShowQuestions = false;
                        this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList
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
                            this.controller.dataStore.ApplicationState.ShowQuestions = false;
                            this.controller.dataStore.ApplicationState.ShowMessageList = !this.controller.dataStore.ApplicationState.ShowMessageList
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
                            this.controller.dataStore.ApplicationState.ShowQuestions = !this.controller.dataStore.ApplicationState.ShowQuestions
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
        if (this.state && this.controller.ComponentFistma) {
            const Rnd = this.controller.ComponentFistma.currentState;
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
                <Column mobile={16} tablet={14} computer={14} largeScreen={12}>

                    <Grid>

                        {Rnd && Rnd.WrappedComponent.CLASS_NAME != "Welcome" &&
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
                            {(!this.controller.dataStore.ApplicationState.ShowMessageList || this.state.ApplicationState.MobileWidth) && 
                                <Rnd />
                            }
                        </Column>
                        {Rnd && Rnd.WrappedComponent.CLASS_NAME != "Welcome" && this.renderGameMenu()}
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
                            this.controller.dataStore.ApplicationState.SelectedMessage = m;
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

export default withRouter(Game);