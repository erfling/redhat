import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import { Grid, Menu, Button, Segment } from 'semantic-ui-react';
const { Column, Row } = Grid;
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import Circles from '-!svg-react-loader?name=Icon!../img/circles.svg';
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';

import { RoleName } from "../../shared/models/UserModel";

class Game extends React.Component<RouteComponentProps<any>, IControllerDataStore & {Game: GameModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameCtrl = GameCtrl.GetInstance(this);

    public static CLASS_NAME = "Game";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
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

    componentDidUpdate(){
    }

    render() {
        if (this.state && this.controller.ComponentFistma) {
        const Rnd = this.controller.ComponentFistma.currentState;
        return <>
            <Menu
                inverted
                fixed="top"
                color="blue"
                borderless
                className="game-header"
                style={{
                    flexShrink: 0, //don't allow flexbox to shrink it
                    borderRadius: 0, //clear semantic-ui style
                    margin: 0,//clear semantic-ui style
                    marginTop: this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN ? '50px' : 0
                }}>
                <Menu.Item
                    header>
                </Menu.Item>
                <Menu.Item
                    onClick={() => this.controller.goBackRound()}
                    header>
                    BACK
                </Menu.Item>
                <Menu.Item
                    onClick={() => this.controller.advanceRound()}
                    header>
                    FORWARD
                </Menu.Item>
                
                <Menu.Item position="right" header>
                    {this.state.ApplicationState.CurrentUser && this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN &&
                        <Button
                            onClick={e => {
                                this.controller.dataStore.ApplicationState.CurrentUser.IsLeader = !this.controller.dataStore.ApplicationState.CurrentUser.IsLeader
                                this.controller.dataStoreChange()
                            }}
                        >
                            Show {this.state.ApplicationState.CurrentUser.IsLeader ? "IC" : "Leader"} Content
                        </Button>
                    }
                </Menu.Item>
            </Menu>
            <Grid
                columns={16}
                className="game-wrapper"
                style={{
                    textAlign: 'left',
                    paddingBottom:'50px'
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
                <Rnd/>
               
            </Grid>
        </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Game);