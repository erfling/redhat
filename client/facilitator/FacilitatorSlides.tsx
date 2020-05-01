import * as React from "react";
import {
  Grid,
  Button,
  Form,
  Label,
  Card,
  Header,
  Segment
} from "semantic-ui-react";
const Field = { Form };
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
import { sortBy } from "lodash";
import ICommonComponentState from "../../shared/base-sapien/client/ICommonComponentState";
import MathUtil from "../../shared/entity-of-the-state/MathUtil";
import ScoringLineChart from "../game/Scoring/ScoringLineChart";
import FacilitatorScoreDisplay from "./FacilitatorScoreDisplay";

interface FSDocument extends Document {
  exitFullscreen: any;
  mozCancelFullScreen: any;
  webkitExitFullscreen: any;
  fullscreenElement: any;
  mozFullScreenElement: any;
  mozRequestFullScreen: any;
  webkitFullscreenElement: any;
}

export default class FacilitatorSlides extends BaseComponent<
  any,
  {
    FacilitatorState: IFacilitatorDataStore;
    ApplicationState: ICommonComponentState;
  }
> {
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
    document.getElementsByTagName("meta")["viewport"].content =
      "width=device-width, initial-scale=1.0, maximum-scale=1";
    this.controller.getGame(location.search.split("game=")[1]);
  }

  componentDidMount() {
    super.componentDidMount();

    this.props.location.pathname
      .split("/")
      .filter(s => s.length > 0)
      .reverse()[0];

    window.addEventListener("keydown", this.handleKey.bind(this));

    const vidSlideNumbers: number[] = [7, 32, 44, 57];
    this.controller
      .getGame(
        this.props.location.pathname
          .split("/")
          .filter(s => s.length > 0)
          .reverse()[0]
      )
      .then(
        () =>
          (this._interval = setInterval(
            () =>
              this.controller
                .getRoundInfo()
                .then((r: FacilitationRoundResponseMapping[]) => {
                  //window.focus();
                  this.controller.dataStore.FacilitatorState.RoundResponseMappings = r;
                }),
            1000
          ))
      );
    this.controller.getLookups();

    let container = document.querySelector(".slides-container");
    let slides: HTMLIFrameElement = document.querySelector("#slides");

    if (this.state.FacilitatorState.CurrentLookup.SlideFeedback) {
      if (this.state.FacilitatorState.Game.Teams.length > 2) {
        this.state.FacilitatorState.CurrentLookup.RoundScoreIdx = this.state.FacilitatorState.CurrentLookup.CumulativeScoreIdx = Math.max(
          3,
          this.state.FacilitatorState.Game.Teams.length - 2
        );
      } else {
        this.state.FacilitatorState.CurrentLookup.RoundScoreIdx = this.state.FacilitatorState.CurrentLookup.CumulativeScoreIdx = this.state.FacilitatorState.Game.Teams.length;
      }
    }
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
        this.setState.bind(this)({
          FullScreen: !this.state.FacilitatorState.FullScreen
        });
        slideIterator = 0;
        break;
      default:
        slideIterator = 0;
    }

    if (!this.state.FacilitatorState.FullScreen) window.focus();

    console.log(slideIterator, key, typeof key, this);
    if (slideIterator)
      this.controller.onClickChangeSlide.bind(this.controller)(slideIterator);
  }

  fitSlidesToWindow() {}

  componentDidUpdate() {}

  componentWillUnmount() {
    clearInterval(this._timeout);
    window.removeEventListener("keydown", this.handleKey);
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
      return (
        this.state &&
        /*this.state.FullScreen && this.state.Game && */ this.state
          .FacilitatorState.Game.CurrentRound &&
        this.state.FacilitatorState.Game.CurrentRound &&
        this.state.FacilitatorState.Game.CurrentRound.SlideNumber &&
        vidSlideNumbers.indexOf(
          this.state.FacilitatorState.Game.CurrentRound.SlideNumber
        ) != -1
      );
    };
    return (
      <React.Fragment>
        {this.state &&
          this.state.FacilitatorState.Game &&
          this.state.FacilitatorState.Game.CurrentRound && (
            <>
              <Fullscreen
                enabled={this.state.FacilitatorState.FullScreen}
                onChange={isFull =>
                  (this.controller.dataStore.FacilitatorState.FullScreen = isFull)
                }
              >
                <>
                  <iframe
                    id="slides"
                    src={
                      "https://https://docs.google.com/presentation/d/1mCqz9ilAX_aTqku1OT2CwnQORfAAGnw8x5urFGz5kM0/edit?ts=5ea82006#slide=id.g3d96c0af36_0_23/embed?start=false&rm=minimal&loop=false&delayms=3000#slide=" +
                      this.state.FacilitatorState.Game.CurrentRound.SlideNumber.toString()
                    }
                    allowFullScreen
                    height={window.innerHeight}
                    width={window.innerWidth}
                  />
                  {this.state.FacilitatorState.Game.CurrentRound.Video && (
                    <Grid className="team-list pin">
                      <Row>
                        <h1 style={{ textDecoration: "underline" }}>
                          <a
                            href={
                              this.state.FacilitatorState.Game.CurrentRound
                                .Video
                            }
                            target="_blank"
                          >
                            View video
                          </a>
                        </h1>
                      </Row>
                    </Grid>
                  )}
                  {this.state.FacilitatorState.Game.CurrentRound.ShowTeams && (
                    <Grid padded stackable columns={3} className="team-list">
                      {sortBy(
                        this.state.FacilitatorState.Game.Teams,
                        "Number"
                      ).map((t, i) => (
                        <Column>
                          <Card fluid key={i} color="blue">
                            <Card.Content>
                              <Card.Header>
                                <Header>{"Team " + t.Number}</Header>
                              </Card.Header>
                            </Card.Content>
                            <Card.Content>
                              {t.Players.map(p => (
                                <Header as="h4">
                                  {p.FirstName} {p.LastName}{" "}
                                  {p.Email && (
                                    <small>
                                      <br />
                                      {p.Email}
                                    </small>
                                  )}
                                </Header>
                              ))}
                            </Card.Content>
                          </Card>
                        </Column>
                      ))}
                    </Grid>
                  )}
                  {this.state.FacilitatorState.Game.CurrentRound.ShowPin && (
                    <Grid
                      padded
                      stackable
                      columns={3}
                      className="team-list pin"
                    >
                      <Row>
                        <h1 style={{ textDecoration: "underline" }}>
                          <a onClick={e => e.preventDefault()}>
                            www.sourcestreamexperience.com
                          </a>
                        </h1>
                      </Row>
                      <Row>
                        <h1>Login: your email address</h1>
                      </Row>
                      <Row>
                        <h1>PIN: {this.state.FacilitatorState.Game.GamePIN}</h1>
                      </Row>
                    </Grid>
                  )}
                  <div className="slides-container top" />
                  <div
                    className={
                      "slides-container bottom " +
                      (isVideoSlider() ? "" : "full")
                    }
                  >
                    <div className="facilitator-scores">
                      {this.state.FacilitatorState.SlideScores.RoundScores &&
                        this.state.FacilitatorState.Game.CurrentRound
                          .SlideNumber != 76 &&
                        this.state.FacilitatorState.SlideScores.RoundScores
                          .length /*&&
                        this.state.FacilitatorState.CurrentLookup
                          .RoundScoreIdx != -1*/ && (
                          <Segment raised>
                            <Header textAlign="center" as="h1">
                              Round Ranking
                            </Header>

                            <FacilitatorScoreDisplay
                              Stepped={true}
                              SubRoundScores={
                                this.state.FacilitatorState.SlideScores
                                  .SubRoundScores
                              }
                              RoundScores={
                                this.state.FacilitatorState.SlideScores
                                  .RoundScores
                              }
                              CumulativeScores={
                                this.state.FacilitatorState.SlideScores
                                  .CumulativeScores
                              }
                              Game={this.state.FacilitatorState.Game}
                              CurrentLookup={
                                this.state.FacilitatorState.CurrentLookup
                              }
                            />
                          </Segment>
                        )}
                    </div>

                    <div className="controls">
                      <Button
                        circular
                        icon="caret left"
                        onClick={() => {
                          this.controller.onClickChangeSlide(-1);
                        }}
                        color="blue"
                      />

                      <Button
                        circular
                        icon="caret right"
                        onClick={() => {
                          this.controller.onClickChangeSlide(1);
                        }}
                        color="blue"
                      />
                      {!isVideoSlider() && (
                        <Button
                          icon="expand"
                          onClick={() => {
                            this.controller.dataStore.FacilitatorState.FullScreen = !this
                              .controller.dataStore.FacilitatorState.FullScreen;
                          }}
                          circular
                          color="blue"
                        />
                      )}
                      <Label>
                        Slide Number{" "}
                        {
                          this.state.FacilitatorState.Game.CurrentRound
                            .SlideNumber
                        }
                      </Label>
                    </div>

                    {this.state &&
                      this.state.FacilitatorState.Game &&
                      this.state.FacilitatorState.Game.CurrentGame &&
                      this.state.FacilitatorState.Game.CurrentGame.CurrentRound
                        .SlideFeedback && (
                        <div className="slide-scores">
                          <h1>Feedback</h1>
                        </div>
                      )}
                  </div>
                  <div className="slides-container left" />
                  <div className="slides-container right" />
                </>
              </Fullscreen>
            </>
          )}
      </React.Fragment>
    );
  }
}
//                        <pre>{this.state.ApplicationState.CurrentGame.CurrentRound && JSON.stringify(this.state.ApplicationState.CurrentGame, null, 2)}</pre>
/**
 * {isVideoSlider() && <div className="double-click-message">
                                   <h2> Double click play for full screen</h2>
                                </div>}
 */
