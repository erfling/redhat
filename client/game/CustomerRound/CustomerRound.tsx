import * as React from "react";
import CustomerRoundCtrl from "./CustomerRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu } = Semantic;
const { Row, Column } = Grid;
import { withRouter, RouteComponentProps } from 'react-router-dom';


class CustomerRound extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: CustomerRoundCtrl = CustomerRoundCtrl.GetInstance(this);

    public static CLASS_NAME = "CustomerRound";
    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        console.log("CONSTRUCTOR OF CUSTOMER ROUND SAYS THIS ABOUT ROUTING:", this.props.location, this.props.match)
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
                    <h1>ROUND FIVE: BUILD THE RELATIONSHIPS</h1>
                </Column>
            </Row>
            
            <Row>
                Form content goes here
            </Row>
        </>;
    }

}

export default withRouter(CustomerRound);