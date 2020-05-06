import * as React from "react";
import CustomerRoundCtrl from "./CustomerRoundCtrl";
import { Route, Switch, Redirect } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import CustomerSub from "./CustomerSub";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class CustomerRound extends BaseComponent<any, IRoundDataStore>
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
                            <h1>ROUND THREE<br/> Customer Round</h1>
                        </Row>
                    </Column>
                    <Switch>
                        <Route path="/game/customerround/customersub" component={CustomerSub} />
                        <Redirect exact from="/game/customerround" to="/game/customerround/customersub" />
                    </Switch>
                                           
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}