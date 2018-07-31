import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import FinanceRoundCtrl from "./FinanceRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from "../FeedBackWrapper";

const { Button, Grid, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class Bid extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Bid";

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

    displayBids() {
        return <Semantic.Segment
                className="bid-wrapper"
            >
                <Header as={this.state.ApplicationState.MobileWidth ? 'h4' : 'h2'}>
                    <Semantic.Icon name='users' />
                    <Header.Content>Highest Bidder: Team {this.state.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid.label}</Header.Content>
                </Header>

                <Header as={this.state.ApplicationState.MobileWidth ? 'h4' : 'h2'}>
                    <Semantic.Icon name='arrow up' />
                    <Header.Content>Highest Bid: ${this.state.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid.data} Bil.</Header.Content>
                </Header>
            </Semantic.Segment>
    }

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == Bid.CLASS_NAME.toUpperCase())[0]


        if (this.state) {
            return <>
                {!this.state.ApplicationState.ShowQuestions && !this.state.ApplicationState.ShowMessageList && this.state.ApplicationState.CurrentTeam && this.state.ApplicationState.CurrentTeam.CurrentRound && this.state.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid &&
                    <Column
                        width={16}
                        className="content-block"
                    >
                        {this.displayBids()}
                    </Column>
                }                

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
                                            this.controller.SaveBid(q.Response, q, thisSubRound)
                                        }}
                                    />
                                </Row>
                            }
                            )}
                        </Form>                        
                        {this.state.ApplicationState.CurrentTeam && this.state.ApplicationState.CurrentTeam.CurrentRound && this.state.ApplicationState.CurrentTeam.CurrentRound.CurrentHighestBid &&
                            this.displayBids()
                        }
                    </div>
                }

                {this.state.ApplicationState.ShowFeedback && thisSubRound && this.state.Scores &&
                    <FeedBackWrapper
                        TeamId={this.state.ApplicationState.CurrentTeam._id}
                        Scores={this.state.Scores}
                        RoundName="Round 3C"
                        Blurb="The winning team chose to bid at a price that was acceptable to both boards. The teams that bid too low or paid over market value have been penalized."
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

                        {this.state.RatingQuestions.map((q, i) => {
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

}