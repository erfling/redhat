import * as React from "react";
import { Grid, Table, Container, Button, Form, Input, Message, Accordion, Icon, Header, Segment } from 'semantic-ui-react';
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

    handleClick = (e, titleProps) => {
        console.log(e, titleProps)
        const { index } = titleProps
        const { AccordionIdx } = this.state.FacilitatorState
        const newIndex = AccordionIdx === index ? -1 : index
        this.controller.dataStore.FacilitatorState.AccordionIdx = newIndex
    }

    componentDidMount() {
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
        .then((g: GameModel) => this._interval = setInterval(() => this.controller.getRoundInfo().then((r: FacilitationRoundResponseMapping[]) => {
            //window.focus();
            this.controller.dataStore.FacilitatorState.RoundResponseMappings = r;
            this.forceUpdate();
        }), 1000));
        this.controller.getLookups();

    }

    componentDidUpdate() {

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
                {this.state.FacilitatorState.AccordionIdx && <pre>{JSON.stringify(this.state.FacilitatorState.AccordionIdx, null, 2)}</pre>}
                {this.state.FacilitatorState.RoundResponseMappings && this.state.FacilitatorState.RoundResponseMappings.length > 0 && <Segment>
                    <Header
                        as="h2"
                    >
                        Round: {this.state.FacilitatorState.RoundResponseMappings[0].SubRoundLabel}
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
                            style={{position: 'absolute', top:'34px'}}
                        >
                            Present Slides
                        </span>

                        <SlideShow
                            style={{ width: '33px', fill: 'white', marginLeft:'100px' }}
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
                </Segment>

                <hr style={{ marginTop: '2em', marginBottom: '2em' }} />

                {this.state.FacilitatorState.RoundResponseMappings && <Row>
                    <Accordion styled style={{ width: '100%' }} exclusive={false} defaultActiveIndex={this.state.FacilitatorState.AccordionIdx}>
                        {this.state.FacilitatorState.RoundResponseMappings.map((t, i) => <>
                            <Accordion.Title active={this.state.FacilitatorState.AccordionIdx.indexOf(i) != 0} index={i} onClick={this.handleClick}>
                                <Icon name='dropdown' />
                                {t.TeamName}
                                {t.IsComplete ? <Icon style={{ marginLeft: '8px' }} name="checkmark" color="green" /> : <Icon name="cancel" color="red" />}
                            </Accordion.Title>
                            <Accordion.Content active={this.state.FacilitatorState.AccordionIdx.indexOf(i) != 0}>
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
        </Grid>
    }

}