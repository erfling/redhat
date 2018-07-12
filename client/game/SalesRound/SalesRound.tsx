import * as React from "react";
import SalesRoundCtrl from "./SalesRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from "react-router";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Menu, Icon } = Semantic;
const { Row, Column } = Grid;

class SalesRound extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    controller: SalesRoundCtrl = SalesRoundCtrl.GetInstance(this);

    public static CLASS_NAME = "SalesRound";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.state = this.controller.dataStore;
    }

    componentWillMount() {
        //this.props.history.push("/game/" + this.constructor.name.toLowerCase());
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