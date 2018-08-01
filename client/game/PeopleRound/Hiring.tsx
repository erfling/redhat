import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import FeedBackWrapper from "../FeedBackWrapper";
import { RatingType } from "../../../shared/models/QuestionModel";

const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class Hiring extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Hiring";

    public static CONTROLLER = PeopleRoundCtrl;

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);
        
        this.controller.ParentController = PeopleRoundCtrl.GetInstance();
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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == Hiring.CLASS_NAME.toUpperCase())[0];
        
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
                                            this.controller.Save1BResponse(q.Response, q, thisSubRound)
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
                        UserId={this.state.ApplicationState.CurrentUser._id}
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.Scores}
                        RoundName="Round 1"
                        Blurb="You set hiring criteria in Round 1A, and your score reflects the degree to which you adhered to your criteria when you made your hiring decisions.
                        For each role, different criteria are most important. For sales, a long-term strategic view and experience in the financial services vertical are necessary. For engineering, it is important to be able to negotiate both internally and with the upstream community, while also having a strong understanding of emerging technologies. For services, it is most critical that the candidate has financial services experience, and also a grasp of emerging technologies."
                    >
                        
                    </FeedBackWrapper> 
                }  
                
                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound && this.state.UserScores &&
                    <FeedBackWrapper
                        UserId={this.state.ApplicationState.CurrentUser._id}
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

                {thisSubRound && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowIndividualFeedback &&
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