import * as React from "react";
import { Grid, Menu, Container, Button, Form, Input, Message } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import { clearTimeout } from "timers";
import SapienServerCom from "../../shared/base-sapien/client/SapienServerCom";
import GameCtrl from '../game/GameCtrl';
import ResponseModel from "../../shared/models/ResponseModel";
import { SliderValueObj } from "../../shared/entity-of-the-state/ValueObj";

export default class AdminLogin extends React.Component<any, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private _timeout;
    

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);
        this.state = {groupedResponses: null}
    }


    componentDidMount(){
        this._timeout = setTimeout(() => {
            SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "gameplay/getfacilitatorresponses/" + GameCtrl.GetInstance().dataStore.ApplicationState.CurrentTeam.GameId).then(groupedResponses => {
                this.setState({groupedResponses})
            })
        }, 5000)
    }

    componentDidUpdate(){

    }


    componentWillUnmount(){
        clearTimeout(this._timeout)
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
                <Column> 
                    {this.state.groupedResponses && Object.keys(this.state.groupedResponses).map(k => {
                        let responses: Array<ResponseModel> = this.state.groupedResponses[k];
                        return <Row
                            className="facilitator-response-row"
                        >
                            <h2>{k}</h2>
                            
                            {responses.length && responses.every(r => !r.targetObjName) && responses.map(r => {
                                return <div
                                >
                                    <h2>{r.questionText || r.QuestionId}</h2>
                                    {r.Answer && (r.Answer as SliderValueObj[]).map(a => {
                                        return <ul>
                                            <li>
                                                {a.label}: {a.data}
                                            </li>
                                        </ul>
                                    })}
                                </div>
                            })

                            }

                            {responses.length && responses.some(r => r.targetObjName) && responses.map(r => {
                                return <div>
                                    <h2>RATING FOR: {r.targetObjName || r.QuestionId}</h2>
                                    {r.Answer && (r.Answer as SliderValueObj[]).map(a => {
                                        return <ul>
                                            <li>
                                                {a.label}: {a.data}
                                            </li>
                                        </ul>
                                    })}
                                </div>
                            })
                            }

                        </Row>
                    })}
                </Column>
            </Row>
        </>

    }

}
//                            disabled={!this.refs.PASSWORD || !this.refs.EMAIL}