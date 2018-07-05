import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { RoleName } from '../../../shared/models/UserModel';
const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class Welcome extends React.Component<RouteComponentProps<any>, RoundModel>
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
                {this.state.CurrentUser && this.state.CurrentUser.Role == RoleName.ADMIN && 
                    <Button
                        onClick={e => this.controller.dataStore.CurrentUser.IsLeader = !this.controller.dataStore.CurrentUser.IsLeader}
                    >
                        Show {this.state.CurrentUser.IsLeader ? "IC" : "Leader"} Content
                    </Button>
                }
                <Grid
                    style={{
                        height:'90vh'
                    }}
                    verticalAlign="middle"
                >
                    <SubRnd/>
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Welcome);