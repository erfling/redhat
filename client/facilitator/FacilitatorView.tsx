import * as React from "react";
import { Grid, Table, Container, Button, Form, Input, Message, Accordion, Icon, Header, Segment, Modal, Checkbox } from 'semantic-ui-react';
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
import FacilitatorSlides from './FacilitatorSlides';
import { RouteComponentProps, withRouter, Switch, Route, Redirect } from "react-router";
import SlideShow from '-!svg-react-loader?name=Icon!../img/slideshow.svg';
import RoundChangeMapping from "../../shared/models/RoundChangeMapping";
import FacilitationRoundResponseMapping from "../../shared/models/FacilitationRoundResponseMapping";
import UserModel, { JobName } from "../../shared/models/UserModel";
import ICommonComponentState from "../../shared/base-sapien/client/ICommonComponentState";
import TeamJobsModal from './TeamJobsModal';
import FacilitatorScoreDisplay from "./FacilitatorScoreDisplay";
import QuestionModel, { QuestionType, RatingType } from "../../shared/models/QuestionModel";
import { orderBy } from 'lodash';
import { stringify } from "querystring";

export default class FacilitatorView extends BaseComponent<any, { FacilitatorState: IFacilitatorDataStore, ApplicationState: ICommonComponentState }>
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

    handleClick = (e, titleProps: { active: boolean, index: number }) => {
        console.log(e, titleProps)
        const { index, active } = titleProps

        if (active) {
            this.controller.dataStore.FacilitatorState.AccordionIdx = this.controller.dataStore.FacilitatorState.AccordionIdx.filter(num => num != index)
        } else {
            this.controller.dataStore.FacilitatorState.AccordionIdx = this.controller.dataStore.FacilitatorState.AccordionIdx.concat(index)
        }



        this.setState(Object.assign(this.state, {
            FacilitatorState: Object.assign(this.state.FacilitatorState, {
                AccordionIdx: this.controller.dataStore.FacilitatorState.AccordionIdx
            })
        }))
    }

    componentDidMount() {
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
            .then((g: GameModel) => {
                this.GetGameStatusInfo();
                this._interval = setInterval(() => this.GetGameStatusInfo(), 5000)
            });
        this.controller.getLookups();

    }

    componentWillUnmount() {
        clearInterval(this._interval)
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

    GetGameStatusInfo() {
        this.controller.getRoundInfo().then((r: FacilitationRoundResponseMapping[]) => {
            //window.focus();
            this.controller.dataStore.FacilitatorState.RoundResponseMappings = r;
            this.setState(Object.assign(this.state, {
                FacilitatoState: Object.assign(this.state.FacilitatorState, {
                    RoundResponseMappings: r
                })
            }))
        });
    }

    getUserIsComplete(mapping: FacilitationRoundResponseMapping, user: UserModel) {

        if (mapping.IsComplete) {
            return <Icon name="checkmark" color="green" />
        }

        if (this.state.FacilitatorState.Game.CurrentRound.ShowIndividualFeedback || this.state.FacilitatorState.Game.CurrentRound.ShowRateUsers) {
            //has the manager rated all the other players?
            if (user.Job == JobName.MANAGER) {
                let completedRatings = mapping.RatingsByManager.filter(r => r.IsComplete);
                if (completedRatings.length == mapping.RatingsByManager.length) return <Icon name="checkmark" color="green" />;
            }
            //has this play rated the manager
            else {
                let thisPlayersRatingOfManager = mapping.RatingsOfManager.filter(r => r.IsComplete && r.UserId && r.UserId == user._id);
                if (thisPlayersRatingOfManager.length) return <Icon name="checkmark" color="green" />;
            }
        }

        // : 
        return <Icon name="cancel" color="red" />
    }

    render() {

        //const activeIndices = this.state.FacilitatorState.RoundResponseMappings.map((response, i) => i) || [];
        const renderResponse = (q: QuestionModel) => {

            if (!q.Response || !q.Response.Answer || !(q.Response.Answer as SliderValueObj[]).length) {
                return <>
                    <p>N/A</p>
                </>
            }

            const answer: SliderValueObj[] = q.Response.Answer as SliderValueObj[];
            const renderAnwser = (a: SliderValueObj) => (
                <div className="facilitator-responses">
                    <h3>{a.label}</h3>

                    <p>
                        <strong>Team's Response: </strong>
                        {a.preunit && a.preunit}{a.data}{a.unit && a.unit}
                        {a.idealValue && a.idealValue == a.data && <Icon
                            name="check"
                            style={{ marginLeft: '5px' }}
                            color="green"
                        />}
                    </p>
                    {a.idealValue &&
                        <>
                            <p>
                                <strong>Ideal Response: </strong>
                                {a.preunit && a.preunit}{a.idealValue}{a.unit && a.unit}

                            </p>
                        </>
                    }
                </div>
            );

            const render1BAnwser = (a: SliderValueObj) => (
                <div className="facilitator-responses">
                    <p>
                        <strong>Team's Response: </strong>
                        {a.label}
                        {a.idealValue == a.label && <Icon
                            name="check"
                            style={{ marginLeft: '5px' }}
                            color="green"
                        />}
                    </p>
                    {a.idealValue && a.idealValue != a.label &&
                        <>
                            <p>
                                <strong>Ideal Response: </strong>
                                {a.idealValue}
                                <Icon
                                    name="cancel"
                                    style={{ marginLeft: '5px' }}
                                    color="red"
                                />
                            </p>
                        </>
                    }
                </div>
            );

            const render2ASlider = (a) => (
                <div className="facilitator-responses">
                    <p>
                        <strong>Team's Response: </strong>
                        {a.preunit && a.preunit}{a.data}{a.unit && a.unit}
                        {a.idealValue && a.idealValue == a.data && <Icon
                            name="check"
                            style={{ marginLeft: '5px' }}
                            color="green"
                        />}
                    </p>
                    {a.idealValue &&
                        <>
                            <p>
                                <strong>Ideal Response: </strong>
                                {a.preunit && a.preunit}{a.idealValue}{a.unit && a.unit}

                            </p>
                        </>
                    }
                </div>
            )

            const renderPriorityAnswers = (q) => {

                return <div className="facilitator-responses">
                    {orderBy(q.Response.Answer, "data").map((a: SliderValueObj, i) => (
                        <>
                            <p>{`${i + 1}. ${a.label}`} (Ideal Position: {Number(a.idealValue) + 1})</p>
                        </>
                    ))}
                </div>
            }

            const renderRatingAnswers = (q) => {

                return <>
                    {orderBy(q.Response.Answer, "label").map((answer: SliderValueObj[], i) => (
                        answer.map(a => <p>{a.label}: {a.data}</p>)
                    ))}
                </>
            }

            switch (q.Type) {

                case QuestionType.MULTIPLE_CHOICE:
                    if (q.SubRoundLabel == "3A" || q.SubRoundLabel == "2A") {
                        return answer.filter(a => a.data == true || a.data == true.toString()).map(a => (
                            renderAnwser(a)
                        ))
                    } else if (q.SubRoundLabel == "1B") {
                        return answer.filter(a => a.data == true || a.data == true.toString()).map(a => (
                            render1BAnwser(a)
                        ))
                    } else {
                        return answer.map(a => (
                            renderAnwser(a)
                        ))
                    }



                case QuestionType.CHECKBOX:
                case QuestionType.TOGGLE:
                case QuestionType.SLIDER:
                case QuestionType.TEXTAREA:
                case QuestionType.NUMBER:
                    if (q.SubRoundLabel == "2A") {
                        return answer.map(a => (
                            render2ASlider(a)
                        ))
                    }
                    else if (q.SubRoundLabel == "4A") {
                        return answer.map(a => <p>{a.data}</p>)
                    }
                    else if (q.RatingMarker == RatingType.TEAM_RATING) {
                        return renderRatingAnswers(q)
                    } else {
                        return answer.map(a => renderAnwser(a))
                    }

                case QuestionType.PRIORITY:
                    return renderPriorityAnswers(q);

                default:
                    return <></>

            }

        }

        const ratingRounds = ["2B"];

        return <Grid
            columns={16}
            className="game-wrapper"
            style={{
                textAlign: 'left',
                paddingBottom: '50px'
            }}
        >
            <Column mobile={16} tablet={16} computer={12} largeScreen={10}>
                <Header as="h1">
                    Facilitator Dashboard
                </Header>
                {this.state.FacilitatorState.RoundResponseMappings && this.state.FacilitatorState.RoundResponseMappings.length > 0 && <Segment>
                    <Header
                        as="h2"
                    >
                        Round: ({this.state.FacilitatorState.RoundResponseMappings[0].RoundName} - {this.state.FacilitatorState.RoundResponseMappings[0].SubRoundName})
                    </Header>
                    <Header
                        as="h2"
                    >
                        Slide: {this.state.FacilitatorState.Game && this.state.FacilitatorState.Game.CurrentRound && this.state.FacilitatorState.Game.CurrentRound.SlideNumber ? this.state.FacilitatorState.Game.CurrentRound.SlideNumber : 1}
                    </Header>
                    <Header
                        as="h2"
                    >
                        PIN: {this.state.FacilitatorState.Game && this.state.FacilitatorState.Game.GamePIN}
                    </Header>


                </Segment>}
                <Segment>
                    <Button
                        as="a"
                        color="blue"
                        onClick={() => window.open("/facilitator/slides/" + this.state.FacilitatorState.Game._id, "_blank")}
                    >
                        <span
                            style={{ position: 'absolute', top: '34px' }}
                        >
                            Present Slides
                        </span>

                        <SlideShow
                            style={{ width: '33px', fill: 'white', marginLeft: '100px' }}
                        />
                    </Button>

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

                    <Modal
                        closeIcon
                        size='fullscreen'
                        trigger={<Button
                            color="blue"
                            icon
                            labelPosition='right'
                            onClick={e => this.controller.getFacilitatorScores()}
                        >
                            Show Scores
                            <Icon name="table" />
                        </Button>}
                    >
                        <Modal.Header>Scores through Round {this.state.FacilitatorState.RoundResponseMappings && this.state.FacilitatorState.RoundResponseMappings.length && this.state.FacilitatorState.RoundResponseMappings[0].SubRoundLabel}</Modal.Header>
                        <Modal.Content>
                            <FacilitatorScoreDisplay
                                Stepped={false}
                                SubRoundScores={this.state.FacilitatorState.FacilitatorScores.SubRoundScores}
                                RoundScores={this.state.FacilitatorState.FacilitatorScores.RoundScores}
                                CumulativeScores={this.state.FacilitatorState.FacilitatorScores.CumulativeScores}
                                Game={this.state.FacilitatorState.Game}
                                CurrentLookup={this.state.FacilitatorState.CurrentLookup}
                            />
                        </Modal.Content>
                    </Modal>

                </Segment>

                <hr style={{ marginTop: '2em', marginBottom: '2em' }} />

                {this.state.FacilitatorState.RoundResponseMappings && <Row>
                    <Accordion styled style={{ width: '100%' }} exclusive={false} defaultActiveIndex={this.state.FacilitatorState.AccordionIdx}>
                        {this.state.FacilitatorState.RoundResponseMappings.map((t, i) => <>
                            <Accordion.Title active={this.state.FacilitatorState.AccordionIdx.indexOf(i) != -1} index={i} onClick={this.handleClick}>
                                <Icon name='dropdown' />
                                {t.TeamName}
                                {t.IsComplete ? <Icon style={{ marginLeft: '8px' }} name="checkmark" color="green" /> : <Icon name="cancel" color="red" />}
                                <Button
                                    onClick={e => {
                                        e.preventDefault();
                                        this.controller.dataStore.FacilitatorState.ModalTeam = t;
                                        this.controller.dataStore.FacilitatorState.ShowRolesModal = true;
                                    }}
                                >
                                    Set Roles
                                </Button>
                                <Button
                                    onClick={e => {
                                        e.preventDefault();
                                        this.controller.getTeamResponses(t, this.state.FacilitatorState.Game.CurrentRound.ChildRound)
                                    }}
                                >
                                    View Responses
                                </Button>

                            </Accordion.Title>
                            <Accordion.Content active={this.state.FacilitatorState.AccordionIdx.indexOf(i) != -1}>
                                <Table striped>

                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Name</Table.HeaderCell>
                                            <Table.HeaderCell>Email</Table.HeaderCell>
                                            <Table.HeaderCell>Role</Table.HeaderCell>
                                            <Table.HeaderCell>Completed</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {(t.Members).map((teamMember, i) => {
                                            let player = Object.assign(new UserModel(), teamMember);
                                            return <Table.Row key={i}>
                                                <Table.Cell style={{ width: '150px' }}>{player.Name}</Table.Cell>
                                                <Table.Cell style={{ width: '100px' }}>{player.Email}</Table.Cell>
                                                <Table.Cell style={{ width: '100px' }}>{player.Job}</Table.Cell>
                                                <Table.Cell style={{ width: '50px' }}>
                                                    {this.getUserIsComplete(t, player)}
                                                </Table.Cell>
                                            </Table.Row>
                                        }
                                        )}
                                    </Table.Body>


                                </Table>
                            </Accordion.Content>
                        </>
                        )}
                    </Accordion>
                </Row>}
            </Column>
            {this.state.FacilitatorState.ShowRolesModal && this.state.FacilitatorState.ModalTeam && <TeamJobsModal
                Team={this.state.FacilitatorState.ModalTeam}
                SaveFunction={this.controller.UpdateTeamJobs.bind(this.controller)}
                CloseFunction={() => {
                    this.controller.dataStore.FacilitatorState.ModalTeam = null;
                    this.controller.dataStore.FacilitatorState.ShowRolesModal = false;
                }}
                ValidationFunc={this.controller.validateTeamJobs.bind(this.controller)}
                Submitting={this.controller.dataStore.FacilitatorState.ModalTeam.IsSaving}
            />}

            {this.state.FacilitatorState.SelectedTeamMapping &&
                <Modal
                    className="scrolling"
                    closeIcon
                    size='fullscreen'
                    onClose={() => {
                        this.controller.dataStore.FacilitatorState.SelectedTeamMapping = null;
                        this.setState({ FacilitatorState: this.controller.dataStore.FacilitatorState })
                    }}
                    open={this.state.FacilitatorState.SelectedTeamMapping && this.state.FacilitatorState.SelectedTeamMapping.Questions.length > 0}
                >
                    <Modal.Header>{this.state.FacilitatorState.SelectedTeamMapping.TeamName}'s Responses</Modal.Header>
                    <Modal.Content>
                        <header>
                            {this.state.FacilitatorState.ModalRoundFilter.rounds.map(r => <Button
                                circular
                                inverted={this.state.FacilitatorState.ModalRoundFilter.value != r}
                                color="blue"
                                onClick={e => {
                                    this.controller.dataStore.FacilitatorState.ModalRoundFilter.value = r;
                                    this.setState({ FacilitatorState: this.controller.dataStore.FacilitatorState })
                                }}
                            >
                                {r}
                            </Button>)}
                            <div
                                className="ratings-switch"
                            >
                                <Checkbox
                                    label="Show Ratings"
                                    toggle
                                    defaultChecked={this.controller.dataStore.FacilitatorState.ModalRoundFilter.showRatings}
                                    onChange={() => {
                                        this.controller.dataStore.FacilitatorState.ModalRoundFilter.showRatings = !this.controller.dataStore.FacilitatorState.ModalRoundFilter.showRatings
                                        this.setState({ FacilitatorState: { ...this.state.FacilitatorState, ...(this.controller.dataStore.FacilitatorState.ModalRoundFilter) } })
                                    }}
                                />
                            </div>
                        </header>
                        {!this.state.FacilitatorState.ModalRoundFilter.showRatings && this.state.FacilitatorState.SelectedTeamMapping.Questions.filter(q => q.RatingMarker != RatingType.IC_RATING && q.RatingMarker != RatingType.MANAGER_RATING && q.RatingMarker != RatingType.TEAM_RATING && ratingRounds.indexOf(q.SubRoundLabel) == -1 && q.SubRoundLabel && q.SubRoundLabel.toUpperCase() == this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase()).map(q => <>
                            <h2>
                                {q.Text}
                            </h2>
                            {renderResponse(q)}
                        </>
                        )}

                        {!this.state.FacilitatorState.ModalRoundFilter.showRatings
                            && (this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase() == "2B"
                                || this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase() == "4B")
                            && this.state.FacilitatorState.SelectedTeamMapping.Questions.filter(q => q.RatingMarker == RatingType.TEAM_RATING).map(q => <>
                                <h2>
                                    Ratings Submitted by {this.state.FacilitatorState.SelectedTeamMapping.TeamName} in Round {this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase()}
                                </h2>
                                {q.Response && q.Response.Answer &&
                                    <>
                                        {(q.Response.Answer as any).map((a: any) => {
                                            return Array.isArray(a) && (a as SliderValueObj[]).filter(a => a.SubRoundLabel.toUpperCase() == this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase()).map(ans => {
                                                return <p>
                                                    {ans.label} {this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase() == "4B" && ` (Team ${ans.TeamLabel})`}: {ans.data}
                                                </p>
                                            })
                                        })}
                                    </>
                                }
                            </>
                            )}

                        {this.state.FacilitatorState.ModalRoundFilter.showRatings
                            && this.state.FacilitatorState.SelectedTeamMapping.Questions
                                .filter(q => q.RatingMarker == RatingType.MANAGER_RATING).map(q => {

                                    let ratings = this.controller.getGroupedRatings(q, "SubmitterLabel");

                                    return <>
                                        <h2>
                                            Ratings Submitted by {this.state.FacilitatorState.SelectedTeamMapping.TeamName} in Round {this.state.FacilitatorState.ModalRoundFilter.value.toUpperCase()}
                                        </h2>
                                        {q.Response && q.Response.Answer &&
                                            <ul className="facilitator-ratings-display">
                                                {Object.keys(ratings).map((k, i) => {
                                                    let subRatings = this.controller.getGroupedChildren(ratings[k], "TargetUserLabel", this.state.FacilitatorState.ModalRoundFilter.value);
                                                    return <li
                                                        key={i}
                                                    >
                                                        <h3>
                                                            Rated By {k}
                                                        </h3>
                                                        <ul>
                                                            {Object.keys(subRatings).map((name, j) => {
                                                                return <li>
                                                                    <p>{name}</p>
                                                                    <div className="rating-display">
                                                                        {subRatings[name].map(a => {
                                                                            if (a.OverrideType || a.label == "Comments") {
                                                                                return <>
                                                                                    <p>{a.label}</p>
                                                                                    <span>{a.data}</span>
                                                                                </>
                                                                            }
                                                                            return <>
                                                                                <p>{a.label}: {a.data}</p>
                                                                            </>
                                                                        })}
                                                                    </div>
                                                                </li>
                                                            })}
                                                        </ul>
                                                    </li>
                                                })}
                                            </ul>
                                        }
                                    </>
                                })}

                    </Modal.Content>
                </Modal>
            }


        </Grid>
    }

}