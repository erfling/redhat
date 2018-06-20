import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import Round1 from './PeopleRound';
import { Grid, Menu, Container, Button, Segment } from 'semantic-ui-react';
const { Column, Row } = Grid;
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";

import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';

class Game extends React.Component<RouteComponentProps<any>, GameModel & ICommonComponentState>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameCtrl;

    public static CLASS_NAME = "Game";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
        this.controller = new GameCtrl(this)
        this.state = this.controller.dataStore;
    }

    componentWillMount() {
        //this.props.history.push("/game/" + Rnd.WrappedComponent.name.toLowerCase());
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
        if(this.state && this.state.ComponentFistma) {
        const Rnd = this.state.ComponentFistma.currentState;
        return <Container
            fluid={true}
        >
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
                    header>
                    Fixed Footer
					</Menu.Item>
            </Menu>
        </Container>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Game);
/**
 * <Switch>
                    {this.state.RoundsFistma._stateMap.map((rnd, i) => {
                        return <Route path={'/game/'+rnd.WrappedComponent.name.toLowerCase()} component={rnd} key={i} />
                    })}
                </Switch>
 */