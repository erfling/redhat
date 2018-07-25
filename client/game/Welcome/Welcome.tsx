import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { withRouter, RouteComponentProps , Redirect} from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import { Route, Switch } from 'react-router'; 
import Intro from "./Intro";
import PlayerLogin from "./PlayerLogin";


const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;

export default class Welcome extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Welcome";

    public static CONTROLLER = WelcomeCtrl;
    
    controller: WelcomeCtrl = WelcomeCtrl.GetInstance(this);

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
        if (this.state) {

            return <>
                <Column mobile={16} tablet={12} computer={8} largeScreen={6}>
                    <Grid>
                        <h1>IN WELCOME</h1>
                        <Switch>
                            <Redirect exact from="/game/welcome/" to="/game/welcome/intro" />
                            <Route path="/game/welcome/intro" component={Intro} />
                            <Route path="/game/welcome/playerlogin" component={PlayerLogin} />   
                        </Switch>                 
                    </Grid>
                </Column>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}