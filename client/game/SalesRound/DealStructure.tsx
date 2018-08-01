import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import SalesRoundCtrl from "./SalesRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from '../FeedBackWrapper';
import TeamModel from "../../../shared/models/TeamModel";
import { ComparisonLabel } from "../../../shared/models/QuestionModel";
import MathUtil from '../../../shared/entity-of-the-state/MathUtil'
import { SliderValueObj } from "../../../shared/entity-of-the-state/ValueObj";

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



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == DealStructure.CLASS_NAME.toUpperCase())[0]

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

                {this.state.ApplicationState.ShowFeedback && thisSubRound && this.state.Scores &&
                    <FeedBackWrapper
                        UserId={this.state.ApplicationState.CurrentUser._id}
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.Scores}
                        RoundName="Round 3A"
                        Blurb="Your goal is both to make a lucrative deal for Source Stream, and also to keep RHK Bank happy. You must balance the short-term deal payoff with the longer-term satisfaction of the customer. Teams that received a customer satisfaction score of 90+ recieve a glowing testimonial from RHK Bank. Pricing and quantity ranges have changed based on your previous decisions."
                    >
                        
                    </FeedBackWrapper> 
                }

                           
                {thisSubRound && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback &&
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
