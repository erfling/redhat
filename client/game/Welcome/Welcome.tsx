import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";

const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;

class Welcome extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
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

        GameCtrl.GetInstance().CurrentComponent = this;
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
            const SubRnd = this.controller.ComponentFistma.currentState;

            return <>
                <Column mobile={16} tablet={12} computer={8} largeScreen={6} >
                    <Grid>
                        <SubRnd />
                    </Grid>
                </Column>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Welcome);