import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from "../FeedBackWrapper";
import { RatingType } from "../../../shared/models/QuestionModel";

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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == EngineeringSub.CLASS_NAME.toUpperCase())[0]

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
                
                {this.state.ApplicationState.ShowFeedback && thisSubRound && this.state.Scores &&
                    <FeedBackWrapper
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.Scores}
                        RoundName="Round 2"
                        Blurb="Giving in to a single player threatens to undermine the openness of OpenVM. It's good in the short term, perhaps, but in the long term limits participation across the platform."
                    >
                        
                    </FeedBackWrapper> 
                }  

                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound && this.state.UserScores &&
                    <FeedBackWrapper
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.UserScores}
                        RoundName="Round 1"                        
                    >
                        
                    </FeedBackWrapper> 
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

                {thisSubRound && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowIndividualFeedback &&
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