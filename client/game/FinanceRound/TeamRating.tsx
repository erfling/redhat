import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import FinanceRoundCtrl from "./FinanceRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from "../Scoring/FeedBackWrapper";

const { Button, Grid, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class TeamRating extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "TeamRating";

    public static CONTROLLER = FinanceRoundCtrl;

    controller: FinanceRoundCtrl = FinanceRoundCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.controller.ParentController = FinanceRoundCtrl.GetInstance();
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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == TeamRating.CLASS_NAME.toUpperCase())[0]


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

                            {thisSubRound.Questions.filter(q => q.TargetTeamId != this.state.ApplicationState.CurrentTeam._id).map((q, i) => {
                                return <Row
                                    key={"question-" + i.toString()}
                                >
                                    <EditableQuestionBlock
                                        Question={q}
                                        idx={i}
                                        key={i}
                                        SubRoundId={thisSubRound._id}
                                        onChangeHander={r => {
                                            console.log("REPONSE IS",r);
                                            r.targetObjId = q.TargetTeamId;
                                            q.SubRoundId = thisSubRound._id
                                            this.controller.SetTeamRatingResponse(thisSubRound.Questions, r)
                                        }}
                                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                    />
                                   
                                    <Button
                                        content='Submit'
                                        icon='checkmark'
                                        labelPosition='right'
                                        color="blue"
                                        disabled={!q.Response || !q.Response.targetObjId}
                                        loading={q.Response ? q.Response.IsSaving : false}
                                        onClick={e => {
                                            console.log(e);
                                            this.controller.SaveSocialResponse(q.Response, q)
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
                        RoundName="Round 1"
                        YaxisDomain={60}
                        Feedback={this.controller.filterFeedBack(this.state.Scores, this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN)}
                        ChartableScores={this.controller.dataStore.ApplicationState.ChartingScores}
                    >
                    </FeedBackWrapper> 
                    </>
                } 
                {this.state.ApplicationState.ShowIndividualFeedback && thisSubRound && this.state.UserScores &&
                    <FeedBackWrapper
                        User={this.state.ApplicationState.CurrentUser}
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

                {thisSubRound && !this.state.ApplicationState.ShowMessageList  && !this.state.ApplicationState.ShowQuestions && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback &&
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