'use strict';
import * as React from "react";
import GameCtrl from "./GameCtrl";
import GameModel from "../../shared/models/GameModel";
import { Grid, Menu, Button, Segment } from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from "react-router";
import Circles from '-!svg-react-loader?name=Icon!../img/circles.svg';
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import { RoleName } from "../../shared/models/UserModel";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

class Game extends BaseComponent<RouteComponentProps<any>, IControllerDataStore & {Game: GameModel}>
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

    componentDidMount () {
        super.componentDidMount();
        if (this.props.location.search){
            console.log("FOUND LOCATION SEARCH", this.props.location.search);
        }

        this.props.history.push("/game/" + (this.state.ComponentFistma.currentState as any).WrappedComponent.CLASS_NAME.toLowerCase());
        
    }

    componentDidUpdate(){
    }

    render() {
        if (this.state && this.controller.ComponentFistma) {
        const Rnd = this.controller.ComponentFistma.currentState;
        return <Grid
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
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Game);