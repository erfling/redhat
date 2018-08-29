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
import { IFrame } from "sanitize-html";
import GameModel from "../../shared/models/GameModel";
import FacilitatorCtrl from "../facilitator/FacilitatorCtrl";

export default class FacilitatorView extends BaseComponent<any, IControllerDataStore & { Game: GameModel, _mobileWidth: boolean, ShowGameInfoPopup: boolean, ShowDecisionPopup: boolean, ShowInboxPopup: boolean; GrowMessageIndicator: boolean } & {groupedResponses: any}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private _timeout;
    
 //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "FacilitatorView";

    public static CONTROLLER = FacilitatorCtrl;

    controller: FacilitatorCtrl = FacilitatorCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.state = this.controller.dataStore;
        document.getElementsByTagName('meta')["viewport"].content = "width=device-width, initial-scale=1.0, maximum-scale=1";
    }


    componentDidMount(){
        this._timeout = setInterval(() => {
            SapienServerCom.GetData(null, null, SapienServerCom.BASE_REST_URL + "gameplay/getfacilitatorresponses/" + GameCtrl.GetInstance().dataStore.ApplicationState.CurrentTeam.GameId).then(groupedResponses => {
                console.log("GOT THING BACK: ", groupedResponses)
                this.setState({groupedResponses})
            })
            .catch((err) => {
                console.error(err);
            })
        }, 5000)


        //punch-viewer-icon punch-viewer-right goog-inline-block
        let container;
        setTimeout(() => {
            container = document.querySelector("#slides-container");
            console.log("found container>>>>>>>>>>>>>",container);

            
        }, 3000)

        setTimeout(() => {
            
            let thing = container.querySelector('.punch-viewer-right');
            console.log("found thing>>>>>>>>>>>>>",thing, container.querySelector("#document"));
        }, 10000)
    }

    componentDidUpdate(){

    }


    componentWillUnmount(){
        clearInterval(this._timeout)
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
                <iframe 
                    id="slides-container"
                    src="https://docs.google.com/presentation/d/e/2PACX-1vRmUlK2iay5zqLlpzkkCv-J5mOlaG2IReIJwrZcNjPtjFq11R4VsFQbD-tycOhb3jZfrIQ_xycO9Q-E/embed?start=false&loop=false&delayms=3000#slide=1" 
                    allowFullScreen
                >
                </iframe>
                <Button
                    onClick={() => {
                        this.controller.onClickChangeSlide(-1);
                    }}
                >
                    back
                </Button>

                <Button
                    onClick={() => {
                       this.controller.onClickChangeSlide(1);
                    }}
                >
                    forward
                </Button>
            </Row>
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