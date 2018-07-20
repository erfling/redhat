import * as React from "react";
import { Grid, Menu, Container, Button, Form, Input } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LoginCtrl';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

class Join extends BaseComponent<RouteComponentProps<any>, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Join";

    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = LoginCtrl.GetInstance(this);
    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
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
            {!this.state || !this.state.ApplicationState.CurrentUser.Name && <Row><h2>Hi. We're getting ready to sign you up.</h2></Row>}
            {this.state && this.state.ApplicationState.CurrentUser.FirstName &&
                <>
                    <Row>
                        <h2>Welcome, {this.state.ApplicationState.CurrentUser.FirstName}</h2>
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
                                loading={this.state.ApplicationState.FormIsSubmitting}
                                disabled={!this.state.ApplicationState.FormIsValid}
                                onClick={() => this.controller.submitNewUserPassword()}
                            >Register</Button>
                        </Form>
                    </Row>
                </>
            }
        </>
    }

}

export default withRouter(Join);