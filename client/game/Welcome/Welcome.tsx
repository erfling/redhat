import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { Redirect} from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import { Route, Switch } from 'react-router'; 
import Intro from "./Intro";
import PlayerLogin from "./PlayerLogin";
import DataStore from "../../../shared/base-sapien/client/DataStore";
import UserModel from "../../../shared/models/UserModel";

const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;

export default class Welcome extends BaseComponent<any, IRoundDataStore>
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

    constructor(props: any) {
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
    
    componentDidMount(){
        super.componentDidMount();
        if(this.props.location && this.props.location.pathname && this.props.location.pathname.toLocaleUpperCase().indexOf("GAME") != -1){
            GameCtrl.GetInstance().ChildController = this.controller;
            GameCtrl.GetInstance().dataStoreDeepProxy.addOnChange(this.controller.dataStoreChange.bind(this.controller))
            console.log("BASE CONTROLLER IN BASE COMPONENT IS:", (GameCtrl.GetInstance().ChildController));
        }

        DataStore.ApplicationState.CurrentUser 
            = this.controller.dataStore.ApplicationState.CurrentUser 
            = GameCtrl.GetInstance().dataStore.ApplicationState.CurrentUser 
            = new UserModel();
    }

    render() {
        if (this.state) {

            return <>
                <Column mobile={16} tablet={12} computer={8} largeScreen={6}>
                    <Grid>
                        <Switch>
                            <Route path="/game/welcome/intro" component={Intro} />
                            <Route path="/game/welcome/playerlogin" component={PlayerLogin} /> 
                            <Redirect exact from="/game/welcome/" to="/game/welcome/intro" />
                        </Switch>                 
                    </Grid>
                </Column>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}