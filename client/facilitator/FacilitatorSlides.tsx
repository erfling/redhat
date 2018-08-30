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
import FacilitatorCtrl, { IFacilitatorDataStore } from "./FacilitatorCtrl";

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


    componentDidMount() {
        super.componentDidMount();
        
        window.addEventListener("resize", () => this.makeItAllBig());
      

    }

    makeItAllBig(){
        alert("embigenning")
        let iFrame: any = document.querySelector("#slides") as HTMLIFrameElement;
        let slidesContainer: any = document.querySelector(".slides-container") as HTMLIFrameElement;

        if (iFrame.requestFullscreen) {
            iFrame.requestFullscreen();
            slidesContainer.requestFullscreen();
        } else if (iFrame.mozRequestFullScreen) { /* Firefox */
            iFrame.mozRequestFullScreen();
            slidesContainer.mozRequestFullScreen()
        } else if (iFrame.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            iFrame.webkitRequestFullscreen();
            slidesContainer.webkitRequestFullscreen()
        } else if (iFrame.msRequestFullscreen) { /* IE/Edge */
            iFrame.msRequestFullscreen();
            slidesContainer.msRequestFullscreen()
        }
    }

    fitSlidesToWindow(){
        
    }

    componentDidUpdate() {

    }


    componentWillUnmount() {
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

        return <React.Fragment>
            <h1>Slide: {this.state.SlideNumber.toString()}</h1>
            <iframe
                id="slides"
                src={"https://docs.google.com/presentation/d/e/2PACX-1vRmUlK2iay5zqLlpzkkCv-J5mOlaG2IReIJwrZcNjPtjFq11R4VsFQbD-tycOhb3jZfrIQ_xycO9Q-E/embed?start=false&loop=false&delayms=3000#slide=" + this.state.SlideNumber.toString()}
                allowFullScreen
                height={window.innerHeight}
                width={window.innerWidth}
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
            <div
                className="slides-container"
                onKeyDown={(e) => {
                    console.log(e);
                    //this.controller.onClickChangeSlide(1);                     
                }}
            >
            </div>
        </React.Fragment>


    }

}
//                            disabled={!this.refs.PASSWORD || !this.refs.EMAIL}