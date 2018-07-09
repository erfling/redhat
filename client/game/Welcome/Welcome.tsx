import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { RoleName } from '../../../shared/models/UserModel';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class Welcome extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: WelcomeCtrl = WelcomeCtrl.GetInstance(this);

    public static CLASS_NAME = "Welcome";

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