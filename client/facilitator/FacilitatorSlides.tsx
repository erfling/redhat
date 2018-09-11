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
        
        window.addEventListener("resize", () => this.makeItAllBig());
        this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0]
      

    }

    makeItAllBig(){
        let d: FSDocument = document as FSDocument;
        d.documentElement.requestFullscreen();
        //override typings
        /*
        if (!d.fullscreenElement &&    // alternative standard method
            !d.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if ((d.documentElement as any)['mozRequestFullScreen']) {
                (d.documentElement as any).mozRequestFullScreen();
            } else if (d.documentElement.webkitRequestFullscreen) {
                d.documentElement.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (d.mozCancelFullScreen) {
                d.mozCancelFullScreen();
            } else if (d.webkitExitFullscreen ) {
                document.webkitExitFullscreen ();
            }
        }
        */
        
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
            {this.state && this.state.ApplicationState && this.state.ApplicationState.CurrentGame &&
            <>
            <Button onClick={e => this.makeItAllBig()}>biggerise</Button>
            <iframe
                id="slides"
                src={"https://docs.google.com/presentation/d/e/2PACX-1vRmUlK2iay5zqLlpzkkCv-J5mOlaG2IReIJwrZcNjPtjFq11R4VsFQbD-tycOhb3jZfrIQ_xycO9Q-E/embed?start=false&loop=false&delayms=3000#slide=" + this.state.ApplicationState.CurrentGame.CurrentRound.SlideNumber.toString()}
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
