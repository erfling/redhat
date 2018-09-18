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

        window.addEventListener('keydown', this.handleKey.bind(this));

        const vidSlideNumbers: number[] = [7, 32, 44, 57];
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
            .then(() => this._interval = setInterval(() => this.controller.getRoundInfo().then((r: FacilitationRoundResponseMapping[]) => {
                //window.focus();
                this.setState({ RoundResponseMappings: r })
            }), 100));
        this.controller.getLookups();

        let container = document.querySelector('.slides-container')
        let slides: HTMLIFrameElement = document.querySelector('#slides');
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

        if (!this.state.FullScreen) window.focus();

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

        const vidSlideNumbers: number[] = [7, 32, 44, 57];
        const isVideoSlider = () => {
            return this.state && /*this.state.FullScreen && this.state.Game && */this.state.Game.CurrentRound && this.state.Game.CurrentRound && this.state.Game.CurrentRound.SlideNumber && vidSlideNumbers.indexOf(this.state.Game.CurrentRound.SlideNumber) != -1;
        }
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
                                src={"https://docs.google.com/presentation/d/e/2PACX-1vR6UUpoWd6qAiNtlMUnhEpi2T2wIUUbyRlNbmAi-blxiYSUg8LmXZXJxmtspTO_q3ZsCoAgujcHRS-W/embed?start=false&rm=minimal&loop=false&delayms=3000#slide=" + this.state.Game.CurrentRound.SlideNumber.toString()}
                                allowFullScreen
                                height={window.innerHeight}
                                width={window.innerWidth}
                            >
                            </iframe>

                            <div className="slides-container top" ></div>
                            <div className={"slides-container bottom " + (isVideoSlider()  ? "" : "full")}>
                                
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
                                    {!isVideoSlider() &&
                                        <Button
                                            icon="expand"
                                            onClick={() => {
                                                this.setState.bind(this)({ FullScreen: !this.state.FullScreen })
                                            }}
                                            circular
                                            color="blue"
                                        >
                                        </Button>
                                    }
                                    <Label>
                                        Slide Number {this.state.Game.CurrentRound.SlideNumber}
                                    </Label>

                                </div>
                            </div>
                            <div className="slides-container left" ></div>
                            <div className="slides-container right" ></div>
                        </>
                    </Fullscreen>


                </>
            }
            
        </React.Fragment>


    }

}
//                        <pre>{this.state.ApplicationState.CurrentGame.CurrentRound && JSON.stringify(this.state.ApplicationState.CurrentGame, null, 2)}</pre>
/**
 * {isVideoSlider() && <div className="double-click-message">
                                   <h2> Double click play for full screen</h2>
                                </div>}
 */