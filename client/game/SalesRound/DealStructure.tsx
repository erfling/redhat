import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import SalesRoundCtrl from "./SalesRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from '../Scoring/FeedBackWrapper';
import TeamModel from "../../../shared/models/TeamModel";
import { ComparisonLabel, RatingType } from "../../../shared/models/QuestionModel";
import MathUtil from '../../../shared/entity-of-the-state/MathUtil'
import ValueObj, { SliderValueObj } from "../../../shared/entity-of-the-state/ValueObj";
import GameCtrl from "../GameCtrl";
import { Icon } from "semantic-ui-react";
import IndividualLineChart from "../Scoring/IndividualLineChart";

const { Button, Grid, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class DealStructure extends BaseComponent<any, IRoundDataStore & { Feedback: TeamModel[] }>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "DealStructure";

    public static CONTROLLER = SalesRoundCtrl;

    controller: SalesRoundCtrl = SalesRoundCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.controller.ParentController = SalesRoundCtrl.GetInstance();
        this.state = this.controller.dataStore;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    componentDidMount() {
        super.componentDidMount();
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == DealStructure.CLASS_NAME.toUpperCase())[0]
        let userRatingsChart;
        if (this.state.SubRound && this.state.UserRatings) {
            userRatingsChart = this.controller.getUserRatingsChartShaped(this.state.UserRatings);
        }
        if (this.state) {
            return <>
                {!this.state.ApplicationState.ShowFeedback && this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER && thisSubRound != null && thisSubRound.Questions &&
                    <div
                        className={(this.state.ApplicationState.ShowQuestions ? 'show ' : 'hide ') + (this.state.ApplicationState.MobileWidth ? "mobile-messages decisions" : "wide-messages decisions")}
                    >
                        <Form
                            style={{ width: '100%' }}
                        >
                            <Header>
                                <Decisions
                                    className="ui circular image"
                                    style={{ width: '40px' }}
                                />
                                Decisions
                            </Header>

                            {thisSubRound.Questions.map((q, i) => {
                                return <Row
                                    key={"question-" + i.toString()}
                                >
                                    <EditableQuestionBlock
                                        Question={q}
                                        idx={i}
                                        key={i}
                                        SubRoundId={thisSubRound._id}
                                        onChangeHander={r => {
                                            console.log(r);
                                            this.controller.handleResponseChange(q, r, thisSubRound.Questions)
                                        }}
                                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                    />

                                </Row>
                            }
                            )}
                            <Button
                                content='Submit'
                                icon='checkmark'
                                labelPosition='right'
                                color="blue"
                                loading={thisSubRound.Questions[0].Response ? thisSubRound.Questions[0].Response.IsSaving : false}
                                onClick={e => {
                                    this.controller.SaveResponses(thisSubRound, thisSubRound.Questions[0])
                                }}
                            />
                        </Form>
                    </div>
                }
                {this.state.ApplicationState.ShowFeedback && thisSubRound && this.state.Scores && <>
                    <FeedBackWrapper
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.Scores}
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.saveFeedback.bind(this.controller)}
                        RoundName="Round 2"
                        YaxisDomain={30}
                        Feedback={this.controller.filterFeedBack(this.state.Scores, this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN)}
                        ChartableScores={this.controller.dataStore.ApplicationState.ChartingScores}
                    >
                        {this.state.ApplicationState.SubroundResponses && 
                        <>
                            <Table striped celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            <Semantic.Label 
                                                ribbon color="blue"
                                            >
                                                <Icon name="attention"/> Important Data
                                            </Semantic.Label>
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>Price Per Customer</Table.HeaderCell>
                                        <Table.HeaderCell>Customer Satisfaction</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {this.state.ApplicationState.SubroundResponses.map((r, i) =>
                                        <Table.Row key={i}>
                                            <Table.Cell>
                                                Team {r.TeamNumber}
                                            </Table.Cell>
                                            <Table.Cell>{(r.Answer as ValueObj[]).filter(a => a.label == ComparisonLabel.PRICE_PER_CUSTOMER).length ? (r.Answer as ValueObj[]).filter(a => a.label == ComparisonLabel.PRICE_PER_CUSTOMER)[0].data : null}</Table.Cell>
                                            <Table.Cell>{(r.Answer as ValueObj[]).filter(a => a.label == ComparisonLabel.CSAT).length ? Math.round( (r.Answer as ValueObj[]).filter(a => a.label == ComparisonLabel.CSAT)[0].data * 1000)/10  : null}</Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                        </>
                        }

                    </FeedBackWrapper>
                </>
                }

                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound &&
                    <IndividualLineChart
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        PlayerId={this.state.ApplicationState.CurrentUser._id}
                        Data={ userRatingsChart || [] }
                        SubRoundId={thisSubRound._id}
                        MessageOnEmpty={this.state.ApplicationState.CurrentUser.Job == 
                            JobName.MANAGER ? "No associates completed your management feedback" : "Your manager failed to complete your performance review"}
                        
                    />
                        }  
{this.state.ApplicationState.ShowRateUsers && this.state.RatingQuestions && <div
                    className={'show ' + (this.state.ApplicationState.MobileWidth ? "mobile-messages decisions" : "wide-messages decisions")}
                >
                    <Form
                        style={{ width: '100%' }}
                    >
                        <Header>
                            <Decisions
                                className="ui circular image"
                                style={{ width: '40px' }}
                            />
                            Decisions
                            </Header>

                        {this.state.RatingQuestions.filter(q => {
                            return q.RatingMarker == RatingType.MANAGER_RATING ? this.state.ApplicationState.CurrentUser.Job != JobName.MANAGER : this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER
                        }).map((q, i) => {
                            return <Row
                                key={"question-" + i.toString()}
                            >
                                <EditableQuestionBlock
                                    Question={q}
                                    idx={i}
                                    key={i}
                                    SubRoundId={thisSubRound._id}
                                    onChangeHander={r => {
                                        console.log(r);
                                        this.controller.updateResponse(q, r)
                                    }}
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                />
                                <Button
                                    content='Submit'
                                    icon='checkmark'
                                    labelPosition='right'
                                    color="blue"
                                    loading={q.Response ? q.Response.IsSaving : false}
                                    onClick={e => {
                                        this.controller.SavePlayerRating(q.Response, q, thisSubRound)
                                    }}
                                />
                            </Row>
                        }
                        )}
                    </Form>
                </div>
                }
                {thisSubRound && !this.state.ApplicationState.ShowMessageList && !this.state.ApplicationState.ShowQuestions && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback &&
                    <EditableContentBlock
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Message={this.state.ApplicationState.SelectedMessage}
                    />
                }
            </>;
        } else {
            return <Dimmer active>
                <Loader>Loading</Loader>
            </Dimmer>
        }
    }

}//                                                ${t.Responses[0].Answer[0].filter(r => r.Answer[0].label == ComparisonLabel.PRICE_PER_CUSTOMER).map(a => a.data) || 'N/A'}
//                                                {t.Responses[0].Answer[0].filter(r => r.Answer[0].label == ComparisonLabel.CSAT).map(a => MathUtil.roundTo(a.data,2)  + '%') || 'N/A'}
