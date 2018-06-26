import * as React from "react";
import FinanceRoundCtrl from "./FinanceRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from "react-router";
const { Button, Grid, Menu, Icon } = Semantic;
const { Row, Column } = Grid;


class FinanceRound extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    controller: FinanceRoundCtrl = FinanceRoundCtrl.GetInstance(this);

    public static CLASS_NAME = "FinanceRound";


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
                    <h1>ROUND 4: GROW THE COMPANY.</h1>
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

export default withRouter(FinanceRound);