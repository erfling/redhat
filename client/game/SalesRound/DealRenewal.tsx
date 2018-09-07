import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import SalesRoundCtrl from "./SalesRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import TeamModel from "../../../shared/models/TeamModel";
import FeedBackWrapper from "../Scoring/FeedBackWrapper";
import { RatingType, ComparisonLabel } from "../../../shared/models/QuestionModel";
import ValueObj, { SliderValueObj } from "../../../shared/entity-of-the-state/ValueObj";
import IndividualLineChart from "../Scoring/IndividualLineChart";
import { Query } from "mongoose";
import ResponseModel from "../../../shared/models/ResponseModel";

const { Button, Grid, Form, Dimmer, Loader, Header, Table, Input, Label } = Semantic;
const { Row, Column } = Grid;

export default class DealRenewal extends BaseComponent<any, IRoundDataStore & { Feedback: TeamModel[] }>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "DealRenewal";

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



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == DealRenewal.CLASS_NAME.toUpperCase())[0]
        let userRatingsChart;
        if (this.state.SubRound && this.state.UserRatings) {
            userRatingsChart = this.controller.getUserRatingsChartShaped(this.state.UserRatings);
        }
        if (this.state) {
            return <>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER && thisSubRound != null && thisSubRound.Questions &&
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
                            <Header>
                                Rate the degree to which the other teams effectively made their case. Give 100% only if a team left no room for improvement.
                            </Header>

                            {thisSubRound.Questions.filter(q => q.targetObjId != this.state.ApplicationState.CurrentTeam._id).map((q, i) => {
                                return <Row
                                    key={"question-" + i.toString()}
                                >
                                    <Form.Field
                                        style={{ maxWidth: '150px' }}
                                    >
                                        <label>{q.Text}</label>
                                        <Input
                                            labelPosition='right'
                                            key={i}
                                            onChange={(e, formValue) => {
                                                if (!q.Response) q.Response = new ResponseModel();
                                                q.Response.ValidationMessage = null;
                                                q.Response.TeamId = q.PossibleAnswers[0].targetObjId;
                                                q.Response.targetObjId = q.PossibleAnswers[0].targetObjId;
                                                q.Response.targetObjClass = "TeamModel"
                                                let num = Number(formValue.value);
                                                if (isNaN(num)){
                                                    q.Response.ValidationMessage = "Must be a number"
                                                } else if (num < 0 || num > 100) {
                                                    q.Response.ValidationMessage = "Must be between 0  and 100"
                                                } else {
                                                    let ans = q.PossibleAnswers[0];
                                                    ans.data = formValue.value;
    
                                                    q.Response.Answer = [ans];
                                                }

                                                
                                               
                                            }}
                                        >
                                            {q.PossibleAnswers[0].preunit && <Label basic>{q.PossibleAnswers[0].preunit}</Label>}
                                            <input pattern="[0-9]*" />
                                            {q.PossibleAnswers[0].unit && <Label basic>{q.PossibleAnswers[0].unit}</Label>}

                                        </Input>
                                        {q.Response && q.Response.ValidationMessage &&
                                            <Label basic color='red' pointing>
                                                {q.Response.ValidationMessage}
                                            </Label>
                                        }
                                    </Form.Field>
                                    <Button
                                        content='Submit'
                                        icon='checkmark'
                                        labelPosition='right'
                                        color="blue"
                                        disabled={q.Response && q.Response.ValidationMessage != null}
                                        loading={q.Response ? q.Response.IsSaving : false}
                                        onClick={e => {
                                            console.log("VALIDATION", this.refs["question_" + i], q.Response)
                                            if (!q.Response.Answer[0] || !q.Response.Answer[0].data || (q.Response.Answer[0].data && isNaN(parseFloat(q.Response.Answer[0].data)))) {
                                                q.Response.ValidationMessage = "Must be between a number";
                                            }

                                            if (q.Response.Answer[0].data && Number(q.Response.Answer[0].data) > q.PossibleAnswers[0].max || Number(q.Response.Answer[0].data) < q.PossibleAnswers[0].min) {
                                                q.Response.ValidationMessage = "Must be between 0 and 100%";
                                            } else {
                                                q.Response.ValidationMessage = null;
                                            }
                                            if (!q.Response.ValidationMessage) {
                                                q.Response.Answer[0].data = Number(q.Response.Answer[0].data);
                                                q.Response.SkipScoring = true;
                                                q.Response.MaxScore = 1;
                                                q.Response.Score = 1 / Number(q.Response.Answer[0].data);
                                                console.log("COMPONENT BEFORE SUBMIT", q.Response);
                                                this.controller.SaveResponse(q.Response, q, thisSubRound)
                                            }
                                        }}
                                    />
                                </Row>
                            }
                            )}

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
                        RoundName="Round 2B"
                        Feedback={this.controller.filterFeedBack(this.state.Scores, this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN)}
                        ChartableScores={this.controller.dataStore.ApplicationState.ChartingScores}
                    >
                    </FeedBackWrapper>
                </>
                }

                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound &&
                    <IndividualLineChart
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        PlayerId={this.state.ApplicationState.CurrentUser._id}
                        Data={userRatingsChart || []}
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

                        {this.state.RatingQuestions.some(q => q["_invalid"]) &&
                            <Header as='h2'>
                                You are not allowed to give more than one associate the same score on the same criteria.
                            </Header>
                        }
                        {this.state.RatingQuestions.filter(q => {
                            return true//q.RatingMarker == RatingType.MANAGER_RATING ? this.state.ApplicationState.CurrentUser.Job != JobName.MANAGER : this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER
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
                                        console.log(r.Answer[0].targetObjId, q.SubText, q.PossibleAnswers[0].targetObjId);
                                        this.controller.updateResponse(q, r)
                                    }}
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                />

                            </Row>
                        })}
                        {this.state.RatingQuestions.some(q => q["_invalid"]) &&
                            <Header as='h3' color='red'>
                                You have given more than one associate the same score on the same criteria.
                            </Header>
                        }
                        <Button
                            style={{marginTop: '1em'}}
                            content='Submit'
                            icon='checkmark'
                            labelPosition='right'
                            color="blue"
                            loading={this.state.ApplicationState.FormIsSubmitting}
                            onClick={e => {
                                if (this.controller.checkRatingQuestions(this.state.RatingQuestions)) {
                                    this.controller.SavePlayerRatings(this.state.RatingQuestions, thisSubRound)
                                }
                            }}
                        />
                        
                    </Form>
                </div>
                }


                {thisSubRound && !this.state.ApplicationState.ShowMessageList && !this.state.ApplicationState.ShowQuestions && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowIndividualFeedback &&
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

}  