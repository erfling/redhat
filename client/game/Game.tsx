import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import Round1 from './PeopleRound';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;
import * as Icons from 'react-icons/lib/io';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";

class Game extends React.Component<RouteComponentProps<any>, GameModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameCtrl;

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
        this.props.history.push("/" + this.constructor.name.toLowerCase());
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
        const Rnd = this.state.RoundsFistma.currentState;
        return <Container
            fluid={true}
        >
            <Menu
                inverted
                fixed="top"
                color="red"
                borderless
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
                    <Icons.IoEmail fontSize="2em"></Icons.IoEmail>
                </Menu.Item>
            </Menu>
            <Grid
                padded={true}
                columns={16}
            >
                <Rnd />
            </Grid>
            <Menu
                inverted
                color="red"
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
    }

}

export default withRouter(Game);