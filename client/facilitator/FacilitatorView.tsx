import * as React from "react";
import { Grid, Table, Container, Button, Form, Input, Message, Accordion, Icon, Header } from 'semantic-ui-react';
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
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { AccordionIdx } = this.state
        const newIndex = AccordionIdx === index ? -1 : index

        this.setState({ AccordionIdx: newIndex })
    }

    componentDidMount() {
        
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
            .then(() => this._interval = setInterval(() => this.controller.getRoundInfo().then((r: FacilitationRoundResponseMapping[]) => this.setState({ RoundResponseMappings: r })), 2000))
        
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

    getUserIsComplete(mapping:FacilitationRoundResponseMapping, user: UserModel){

        if(mapping.IsComplete) {
            return <Icon name="checkmark" color="green" />
        }

        if(this.state.Game.CurrentRound.ShowIndividualFeedback || this.state.Game.CurrentRound.ShowRateUsers){
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

        return <Grid
            columns={16}
            className="game-wrapper"
            style={{
                textAlign: 'left',
                paddingBottom: '50px'
            }}
        >

            <Column mobile={16} tablet={16} computer={12} largeScreen={10}>
                {this.state.RoundResponseMappings && <Row>
                    <Header
                        as="h2"
                    >
                        Round: {this.state.RoundResponseMappings[0].SubRoundLabel}
                    </Header>
                </Row>}
                <Row>
                    <Button
                        as="a"
                        onClick={() => window.open("/facilitator/slides/" + this.state.Game._id, "_blank")}
                    >
                        Present Slides <SlideShow />
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

                <hr style={{ marginTop: '2em', marginBottom: '2em' }} />

                {this.state.RoundResponseMappings && <Row>
                    <Accordion styled style={{ width: '100%' }}>
                        {this.state.RoundResponseMappings.map((t, i) => <>
                            <Accordion.Title active={this.state.AccordionIdx === i} index={i} onClick={this.handleClick}>
                                <Icon name='dropdown' />
                                {t.TeamName}
                                {t.IsComplete ? <Icon style={{marginLeft:'8px'}} name="checkmark" color="green" /> : <Icon name="cancel" color="red" />}
                            </Accordion.Title>
                            <Accordion.Content active={this.state.AccordionIdx === i}>
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
                                                <Table.Cell style={{width:'150px'}}>{player.Name}</Table.Cell>
                                                <Table.Cell style={{width:'100px'}}>{player.Email}</Table.Cell>
                                                <Table.Cell style={{width:'100px'}}>{player.Job}</Table.Cell>
                                                <Table.Cell style={{width:'50px'}}>
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