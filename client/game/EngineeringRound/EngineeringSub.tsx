import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from "../Scoring/FeedBackWrapper";
import { RatingType } from "../../../shared/models/QuestionModel";
import IndividualLineChart from "../Scoring/IndividualLineChart";

const { Button, Grid, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class EngineeringSub extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "EngineeringSub";

    public static CONTROLLER = EngineeringRoundCtrl;

    controller: EngineeringRoundCtrl = EngineeringRoundCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.controller.ParentController = EngineeringRoundCtrl.GetInstance();
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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == EngineeringSub.CLASS_NAME.toUpperCase())[0];
        let userRatingsChart: any[] = ["test"];
        if (this.state.SubRound && this.state.UserRatings) {
            userRatingsChart = this.controller.getUserRatingsChartShaped(this.state.UserRatings, thisSubRound);
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
                                            this.controller.SaveResponse(q.Response, q, thisSubRound)
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
                        RoundName="Round 3"
                        YaxisDomain={50}
                        Feedback={this.controller.filterFeedBack(this.state.Scores, this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN)}
                        ChartableScores={this.controller.dataStore.ApplicationState.ChartingScores}
                    >
                    </FeedBackWrapper> 
                    </>
                }   

                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound && this.state.UserScores &&
                    <>
                        <FeedBackWrapper
                            User={this.state.ApplicationState.CurrentUser}
                            TeamId={this.state.ApplicationState.CurrentTeam._id}
                            Scores={this.state.UserScores}
                            RoundName="Round 3"                        
                        >
                            
                        </FeedBackWrapper>
                    </>
                }

                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound &&
                    <IndividualLineChart
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        PlayerId={this.state.ApplicationState.CurrentUser._id}
                        Data={ userRatingsChart }
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

                {thisSubRound && !this.state.ApplicationState.ShowMessageList  && !this.state.ApplicationState.ShowQuestions && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowRateUsers && !this.state.ApplicationState.ShowIndividualFeedback &&
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
/**<Table striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Question</Table.HeaderCell>
                                    <Table.HeaderCell>Answer</Table.HeaderCell>
                                    <Table.HeaderCell>Feedback</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {thisSubRound.Questions.map((q, i) =>
                                    q.PossibleAnswers.map((pa, j) => {
                                        return <Table.Row key={j}>
                                                    <Table.Cell>{pa.label}</Table.Cell>
                                                    <Table.Cell>{q.Response.Answer[j].data}</Table.Cell>
                                                    <Table.Cell>
                                                        {q.Response.Answer[j].data == "true" ?
                                                            (j == 0) ? "Giving in to ChipCo threatens to undermine the openness of OpenVM. It's good in the short term, perhaps, but in the long term limits participation across the platform." :
                                                            (j == 1) ? "1 true" :
                                                            (j == 2) ? "2 true" :
                                                            "3 true"
                                                        :
                                                            (j == 0) ? "Smart. Easy to over-react to the needs of a single contributor." :
                                                            (j == 1) ? "1 false" :
                                                            (j == 2) ? "2 false" :
                                                            "3 false"
                                                        }
                                                    </Table.Cell>
                                                </Table.Row>
                                    })
                                )}

                            </Table.Body>

                        </Table> */