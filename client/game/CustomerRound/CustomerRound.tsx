import * as React from "react";
import CustomerRoundCtrl from "./CustomerRoundCtrl";
import { withRouter, RouteComponentProps, Route } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import CustomerSub from "./CustomerSub";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

class CustomerRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "CustomerRound";

    public static CONTROLLER = CustomerRound;

    controller: CustomerRoundCtrl = CustomerRoundCtrl.GetInstance(this);

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

    componentDidMount(){
        super.componentDidMount();
        if(this.props.location && this.props.location.pathname && this.props.location.pathname.toLocaleUpperCase().indexOf("GAME") != -1){
            GameCtrl.GetInstance().ChildController = this.controller;
            GameCtrl.GetInstance().dataStoreDeepProxy.addOnChange(this.controller.dataStoreChange.bind(this.controller))
            console.log("BASE CONTROLLER IN BASE COMPONENT IS:", (GameCtrl.GetInstance().ChildController));
        }
    }
    
    render() {
        if (this.state && this.controller.ComponentFistma) {

            return <>
                <Grid>
                    <Column
                        className="content-block"
                        width={16}
                    >
                        <Row
                            style={{
                                marginBottom: '-10px'
                            }}
                        >
                            <h1>round five: customer round</h1>
                        </Row>
                    </Column>
                    <Route path="/game/customerround" component={CustomerSub} />
                    <Route path="/game/customerround/customersub" component={CustomerSub} />                          
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(CustomerRound);