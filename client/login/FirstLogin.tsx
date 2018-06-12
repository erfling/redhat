import * as React from "react";
import UserModel from "../../shared/models/UserModel";
import { Grid, Menu, Container, Button, Form, Input } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
//import * as Icons from 'react-icons/lib/io';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LogtinCtrl'

class FirstLogin extends React.Component<RouteComponentProps<any>, UserModel & {FormIsValid?: boolean, FormIsSubmitting?: boolean}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: LoginCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.props.history.push("/login/join")
        this.controller = new LoginCtrl(this)
        this.state = this.controller.dataStore;
        const token = this._parseURLQueryStrings(this.props.location.search).token;
        if (token) localStorage.setItem("rhjwt", token);
        this.controller.AttemptFirstLogin();
        console.log(token);
    }

    private _parseURLQueryStrings(query: string): any {
        const queryArray = query.split('?')[1].split('&');
        let queryParams: any = {};
        for (let i = 0; i < queryArray.length; i++) {
            const [key, val] = queryArray[i].split('=');
            queryParams[key] = val ? val : true;
        }
        return queryParams;

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

        const validator = () => {
            return false;
        }

        return <>
            {!this.state || !this.state.Name && <Row><h2>Hi. We're getting ready to sign you up.</h2></Row>}
            {this.state && this.state.FirstName &&
                <>
                    <Row>
                        <h2>Welcome, {this.state.FirstName}</h2>
                    </Row>
                    <Row>
                        <Form>
                            <Form.Field>
                                <label>Password</label>
                                <input 
                                    onChange={() => this.controller._onChangeValidateFirstLoginForm()}
                                    type="password" 
                                    ref="PASSWORD_1" 
                                    placeholder='Password' 
                                />
                                <label 
                                    className={(this.refs as any).PASSWORD_1 && (this.refs as any).PASSWORD_1.value && (this.refs as any).PASSWORD_1.value.length > 7 ? "" : "error"}
                                >
                                    Should be 8 characters or more
                                </label>
                                <label className={(this.refs as any).PASSWORD_1 && (this.refs as any).PASSWORD_1.value && /[A-Z]/.test((this.refs as any).PASSWORD_1.value) ? "" : "error"}>Should have at least one uppercase letter</label>
                            </Form.Field>
                            <Form.Field>
                                <label>Verify Password</label>
                                <input 
                                    onChange={() => this.controller._onChangeValidateFirstLoginForm()}
                                    type="password" 
                                    ref="PASSWORD_2" 
                                    placeholder='Password' 
                                />                           
                            </Form.Field>
                            <Button                                 
                                primary
                                loading={this.state.FormIsSubmitting}
                                disabled={!this.state.FormIsValid}
                                onClick={() => this.controller.submitNewUserPassword()}
                            >Register</Button>
                        </Form>
                    </Row>
                </>
            }
        </>
    }

}

export default withRouter(FirstLogin);