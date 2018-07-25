import * as React from "react";
import { Grid, Menu, Container, Button, Form, Input, Message } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
import LoginCtrl from './LoginCtrl';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class AdminLogin extends BaseComponent<any, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Admin";

    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = LoginCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.props.history.push("/login/admin");
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
                <Column wide={6} computer={8} tablet={6} mobile={16}> 
                    <Form>
                        <Form.Field>
                            <label>Email</label>
                            <input
                                onChange={(e) => this.state.ApplicationState.CurrentUser.Email = e.target.value}
                                ref="EMAIL"
                                placeholder='Email'
                            />

                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <input
                                onChange={(e) => this.state.ApplicationState.CurrentUser.Password = e.target.value}
                                type="password"
                                ref="PASSWORD"
                                placeholder='Password'
                            />
                        </Form.Field>
                        <Button
                            primary
                            loading={this.state.ApplicationState.FormIsSubmitting}
                            onClick={() => this.controller.AdminLogin()}
                        >Log in</Button>
                        {this.state && this.state.ApplicationState.FormError &&
                            <Message negative>
                                <Message.Header>{this.state.ApplicationState.FormError}</Message.Header>
                            </Message>
                        }
                    </Form>
                </Column>
            </Row>
        </>

    }

}
//                            disabled={!this.refs.PASSWORD || !this.refs.EMAIL}