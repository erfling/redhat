import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Form, Dimmer, Loader, Message } = Semantic;
const { Row, Column } = Grid;
import IntroLogo from '-!svg-react-loader?name=Icon!../../img/intro-logo.svg';
import { IRoundDataStore } from "../../../shared/base-sapien/client/BaseRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";

export default class PlayerLogin extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "PlayerLogin";

    public static CONTROLLER = WelcomeCtrl;
    
    controller: WelcomeCtrl = WelcomeCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.controller.ParentController = WelcomeCtrl.GetInstance();
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
        if (this.state) {
            return <>
            <h1>Login</h1>
                <Column width={16}>
                    <Grid>
                        <Column mobile={16} tablet={12} computer={8} largeScreen={6} 
                            style={{
                                textAlign: 'left'
                            }}
                        >
                            
                            <Row>
                                <IntroLogo
                                    className="intro-logo"
                                />
                            </Row>
                            
                            <Row>
                                <Form>
                                    <Form.Field>
                                        <Semantic.Label>Email</Semantic.Label>
                                        <Semantic.Input
                                            onChange={(e, semanticStuff) => this.controller.dataStore.ApplicationState.CurrentUser.Email = semanticStuff.value}
                                            ref="EMAIL"
                                            placeholder='Email'
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Semantic.Label>PIN</Semantic.Label>
                                        <Semantic.Input
                                            onChange={(e, semanticStuff) => this.controller.dataStore.ApplicationState.CurrentGame.GamePIN = parseInt(semanticStuff.value)}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Button 
                                            color="blue"
                                            onClick={e => this.controller.LoginPlayer()}
                                        >
                                            Login
                                        </Button>
                                    </Form.Field>
                                    {this.state && this.state.ApplicationState.FormError &&
                                        <Message negative>
                                            <Message.Header>{this.state.ApplicationState.FormError}</Message.Header>
                                        </Message>
                                    }
                                </Form>

                            </Row>
                        </Column>
                    </Grid>

                </Column>

            </>;
        } else {
            return <Dimmer active>
                <Loader>Loading</Loader>
            </Dimmer>
        }
    }

}