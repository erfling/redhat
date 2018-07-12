import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from "react-router";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Menu } = Semantic;
const { Row, Column } = Grid;


class EngineeringRound extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    controller: EngineeringRoundCtrl = EngineeringRoundCtrl.GetInstance(this);

    public static CLASS_NAME = "EngineeringRound";

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
                    <h1>ROUND TWO: BUILD THE SOLUTION</h1>
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

export default withRouter(EngineeringRound);