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
import FacilitatorCtrl, {IFacilitatorDataStore} from "./FacilitatorCtrl";
import FacilitatorSlides from './FacilitatorSlides';
import { RouteComponentProps, withRouter, Switch, Route, Redirect } from "react-router";
import SlideShow from '-!svg-react-loader?name=Icon!../img/slideshow.svg';

export default class FacilitatorView extends BaseComponent<any, IFacilitatorDataStore>
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
       
        //punch-viewer-icon punch-viewer-right goog-inline-block
        let container;
        setTimeout(() => {
            container = document.querySelector("#slides-container");
            console.log("found container>>>>>>>>>>>>>",container);

            
        }, 3000)

        setTimeout(() => {
            
            let thing = container.querySelector('.punch-viewer-right');
            console.log("found thing>>>>>>>>>>>>>",thing, container.querySelector("#document"));
        }, 10000);


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
            <h1>Slide: {this.state.SlideNumber.toString()}</h1>

               <Button
                    as="a"
                    onClick={() => window.open("/facilitator/slides?game=" + GameCtrl.GetInstance().dataStore.ApplicationState.CurrentTeam.GameId, "_blank")}
               >
                 Present Slides <SlideShow/>
               </Button>

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