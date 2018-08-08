import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../shared/models/FeedBackModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import ValueObj, { SliderValueObj } from "../../shared/entity-of-the-state/ValueObj";
import ResponseModel from "../../shared/models/ResponseModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import DataStore from '../../shared/base-sapien/client/DataStore';
import SubRoundFeedback, { ValueDemomination } from "../../shared/models/SubRoundFeedback";
import EditableContentBlock from "../../shared/base-sapien/client/shared-components/EditableContentBlock";
import MessageModel from "../../shared/models/MessageModel";

interface FeedBackProps {
    RoundName: string;
    Blurb?: string;
    Scores: FeedBackModel[];
    TeamId: string;
    User?: UserModel;
    Feedback?: SubRoundFeedback[];
    Message?:  MessageModel | SubRoundFeedback,
    SubRoundId?: string;
    onSaveHandler?(message: MessageModel, subroundId: string): void;
    IsEditable?: boolean, 
}

export default class FeedBackWrapper extends React.Component<FeedBackProps, any>
{
    constructor(props: FeedBackProps) {
        props = props || {
            RoundName: null,
            Blurb: null,
            Scores: null,
            TeamId: null,
            User: null,
            Feedback: null
        }
        super(props);

        this.state = Object.assign(this.props)
    }

    private _stripHtml(htmlString) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = htmlString;
        return tmp.textContent || tmp.innerText || "";
    }

    private _getIndividualFeedback() {
        let userResponses: ResponseModel[] = [];
        //get the responses for the user
        if (this.props.User._id && this.props.Scores) {
            this.props.Scores.forEach(s => {
                if (s.IndividualFeedBack) {
                    s.IndividualFeedBack.forEach(r => {
                        if (r.targetObjId == this.props.User._id)
                            userResponses.push(r)
                    })
                }
            })
            //return this.props.Scores.filter(s => s.TargetObjectId == this.props.UserId);
        }
        return userResponses;
    }

    render() {

        const { RoundName } = this.props

        const { Scores, TeamId } = this.props;

        return <Column
            width={16}
            className="feedback"
        >
            <Header>
                <Icon name="volume up" />{RoundName} Feedback
            </Header>

            {this.props.children}

            {this.props.User &&
                <Segment raised>
                    Individual Ratings
                    {this.props.User.Job == JobName.MANAGER ?
                        <>
                            <p>
                                Inclusive meritocracy: {DataStore.threeRandomNumbers[0]}
                            </p>
                            <p>
                                Coaching: {DataStore.threeRandomNumbers[1]}
                            </p>
                            <p>
                                Influence: {DataStore.threeRandomNumbers[2]}
                            </p>
                        </>
                        :
                        <>
                            <p>
                                Negotiation: {DataStore.threeRandomNumbers[1]}
                            </p>
                            <p>
                                Courage: {DataStore.threeRandomNumbers[0]}
                            </p>
                            <p>
                                Collaboration: {DataStore.threeRandomNumbers[2]}
                            </p>
                        </>
                    }
                </Segment>
            }


            <Table striped celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>Round Score</Table.HeaderCell>
                        <Table.HeaderCell>Game Score</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {Scores && Scores.map((s, i) =>
                        <Table.Row key={i}>
                            <Table.Cell>
                                {s.Label}
                            </Table.Cell>
                            <Table.Cell >{s.TotalRoundScore}</Table.Cell>
                            <Table.Cell >{s.TotalGameScore}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>

            {this.props.Scores && <>
                {this.props.Feedback.map((fb, i) => <Segment
                        key={i}
                        color={fb.ValueDemomination == ValueDemomination.NEGATIVE ? "red" : fb.ValueDemomination == ValueDemomination.POSITIVE ? "green" : "blue"}
                        inverted={fb.ValueDemomination == ValueDemomination.NEGATIVE || fb.ValueDemomination == ValueDemomination.POSITIVE}
                    >
                        <EditableContentBlock
                            Message={fb}
                            SubRoundId={this.props.SubRoundId}
                            onSaveHandler={this.props.onSaveHandler}
                            IsEditable={this.props.IsEditable}
                        />

                    </Segment>
                )}
            </>
            }
            
        </Column>
    }

}
/** 
 *  message:  MessageModel | SubRoundFeedback,
    SubRoundId: string;
    onSaveHandler(message: MessageModel, subroundId: string): void;
    IsEditable: boolean, */