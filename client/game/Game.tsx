import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import { Grid, Menu, Container, Button, Segment } from 'semantic-ui-react';
const { Column, Row } = Grid;
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import { IGamePlayModel } from '../../shared/base-sapien/client/DataStore'

import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import { RoleName } from "../../shared/models/UserModel";

class Game extends React.Component<RouteComponentProps<any>, IGamePlayModel & ICommonComponentState>
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

    render() {
        if (this.state && this.controller.ComponentFistma) {
        const Rnd = this.controller.ComponentFistma.currentState;
        return <Container
            fluid={true}
        >
            {this.state && this.state.IsEditing && <h1>EDIT MODE</h1>}
            <Menu
                inverted
                fixed="top"
                color="blue"
                borderless
                className="game-header"
                style={{
                    flexShrink: 0, //don't allow flexbox to shrink it
                    borderRadius: 0, //clear semantic-ui style
                    margin: 0 //clear semantic-ui style
                }}>
                <Menu.Item
                    header>
                    Global game header
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
                </Menu.Item>
            </Menu>
            <Grid
                padded={true}
                columns={16}
            >
                <Rnd/>
            </Grid>
        </Container>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Game);