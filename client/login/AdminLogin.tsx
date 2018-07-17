import * as React from "react";
import UserModel from "../../shared/models/UserModel";
import { Grid, Menu, Container, Button, Form, Input, Message } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
//import * as Icons from 'react-icons/lib/io';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LoginCtrl';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";

class AdminLogin extends React.Component<RouteComponentProps<any>, UserModel & IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Admin";

    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = new LoginCtrl(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.props.history.push("/login/admin");
        this.state = this.controller.dataStore;
    }

    componentWillMount() { }

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
                                onChange={(e) => this.controller.dataStore.Email = e.target.value}
                                ref="EMAIL"
                                placeholder='Email'
                            />

                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <input
                                onChange={(e) => this.controller.dataStore.Password = e.target.value}
                                type="password"
                                ref="PASSWORD"
                                placeholder='Password'
                            />
                        </Form.Field>
                        <Button
                            primary
                            loading={this.state.FormIsSubmitting}
                            onClick={() => this.controller.AdminLogin()}
                        >Log in</Button>
                        {this.state && this.state.FormError &&
                            <Message negative>
                                <Message.Header>{this.state.FormError}</Message.Header>
                            </Message>
                        }
                    </Form>
                </Column>
            </Row>
        </>

    }

}
//                            disabled={!this.refs.PASSWORD || !this.refs.EMAIL}

export default withRouter(AdminLogin);