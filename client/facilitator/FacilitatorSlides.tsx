import * as React from "react";
import { Grid, Menu, Container, Button, Form, Input, Message, Label } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import { clearTimeout } from "timers";
import SapienServerCom from "../../shared/base-sapien/client/SapienServerCom";
import ResponseModel from "../../shared/models/ResponseModel";
import { SliderValueObj } from "../../shared/entity-of-the-state/ValueObj";
import { IFrame } from "sanitize-html";
import GameModel from "../../shared/models/GameModel";
import FacilitatorCtrl, { IFacilitatorDataStore } from "./FacilitatorCtrl";
import Fullscreen from "react-full-screen";
import FacilitationRoundResponseMapping from "../../shared/models/FacilitationRoundResponseMapping";

interface FSDocument extends Document {
    exitFullscreen: any;
    mozCancelFullScreen: any;
    webkitExitFullscreen: any;
    fullscreenElement: any;
    mozFullScreenElement: any;
    mozRequestFullScreen: any;
    webkitFullscreenElement: any;
}

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

    public static CLASS_NAME = "FacilitatorSlides";

    public static CONTROLLER = FacilitatorCtrl;

    controller: FacilitatorCtrl = FacilitatorCtrl.GetInstance(this);
    private _interval;


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.state = this.controller.dataStore;
        document.getElementsByTagName('meta')["viewport"].content = "width=device-width, initial-scale=1.0, maximum-scale=1";
        this.controller.getGame(location.search.split('game=')[1]);

    }


    componentDidMount() {
        super.componentDidMount();

        this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0]

        window.addEventListener('keydown', this.handleKey.bind(this))
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
            .then(() => this._interval = setInterval(() => this.controller.getRoundInfo().then((r: FacilitationRoundResponseMapping[]) => this.setState({ RoundResponseMappings: r })), 2000));
        this.controller.getLookups();

    }

    handleKey(e: any) {
        const key = e.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"

        let slideIterator: 1 | -1 | 0;


        switch (key) {

            case "ArrowLeft":
            case "PageUp":
                slideIterator = -1;
                break;
            case "ArrowRight":
            case "PageDown":
                slideIterator = 1;
                break;

            case ".":
                this.setState.bind(this)({ FullScreen: !this.state.FullScreen })
                slideIterator = 0;
                break;
            default:
                slideIterator = 0;
        }
        console.log(slideIterator, key, typeof key, this)
        if (slideIterator) this.controller.onClickChangeSlide.bind(this.controller)(slideIterator)
    }



    fitSlidesToWindow() {

    }

    componentDidUpdate() {

    }


    componentWillUnmount() {
        clearInterval(this._timeout);
        window.removeEventListener('keydown', this.handleKey)

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
            {this.state && this.state.Game && this.state.Game.CurrentRound &&
                <>
                    <Fullscreen
                        enabled={this.state.FullScreen}
                        onChange={isFull => this.setState({ FullScreen: isFull })}
                    >
                        <>
                            <iframe
                                id="slides"
                                src={"https://docs.google.com/presentation/d/e/2PACX-1vRmUlK2iay5zqLlpzkkCv-J5mOlaG2IReIJwrZcNjPtjFq11R4VsFQbD-tycOhb3jZfrIQ_xycO9Q-E/embed?start=false&rm=minimal&loop=false&delayms=3000#slide=" + this.state.Game.CurrentRound.SlideNumber.toString()}
                                allowFullScreen
                                height={window.innerHeight}
                                width={window.innerWidth}
                            >
                            </iframe>
                            <div className="slides-container">
                                <div className="controls">
                                    <Button
                                        circular
                                        icon="caret left"
                                        onClick={() => {
                                            this.controller.onClickChangeSlide(-1);
                                        }}
                                        color="blue"
                                    >
                                    </Button>

                                    <Button
                                        circular
                                        icon="caret right"
                                        onClick={() => {
                                            this.controller.onClickChangeSlide(1);
                                        }}
                                        color="blue"
                                    >
                                    </Button>

                                    <Button
                                        icon="expand"
                                        onClick={() => {
                                            this.setState.bind(this)({ FullScreen: !this.state.FullScreen })
                                        }}
                                        circular
                                        color="blue"
                                    >
                                    </Button>
                                    <Label>
                                        Slide Number {this.state.Game.CurrentRound.SlideNumber}
                                    </Label>

                                </div>
                            </div>
                        </>
                    </Fullscreen>


                </>
            }
            <div
                className="slides-container-off"
                onKeyDown={(e) => {
                    console.log(e);
                    //this.controller.onClickChangeSlide(1);                     
                }}
            >
            </div>
        </React.Fragment>


    }

}
//                        <pre>{this.state.ApplicationState.CurrentGame.CurrentRound && JSON.stringify(this.state.ApplicationState.CurrentGame, null, 2)}</pre>
