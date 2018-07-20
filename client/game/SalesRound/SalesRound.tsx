import * as React from "react";
import SalesRoundCtrl from "./SalesRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from "react-router";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";

const { Button, Grid, Menu, Icon } = Semantic;
const { Row, Column } = Grid;

class SalesRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    public static CLASS_NAME = "SalesRound";

    public static CONTROLLER = SalesRoundCtrl;
    
    controller: SalesRoundCtrl = SalesRoundCtrl.GetInstance(this);

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
        return <>

            <Row>
                <Column computer={12} mobile={16} tablet={16}>
                    <h1>ROUND THREE: DO THE DEAL</h1>
                </Column>
            </Row>
            <Grid
                padded={true}
            >
            </Grid>
            <Row>
                Form content goes here
            </Row>
        </>;
    }

}

export default withRouter(SalesRound);