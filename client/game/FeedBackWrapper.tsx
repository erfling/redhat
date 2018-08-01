import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../shared/models/FeedBackModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import ValueObj, { SliderValueObj } from "../../shared/entity-of-the-state/ValueObj";
import ResponseModel from "../../shared/models/ResponseModel";
import UserModel, { JobName } from "../../shared/models/UserModel";
import DataStore from '../../shared/base-sapien/client/DataStore';

interface FeedBackProps {
    RoundName: string;
    Blurb?: string;
    Scores: FeedBackModel[];
    TeamId: string;
    User?: UserModel;
}

export default class FeedBackWrapper extends React.Component<FeedBackProps, any>
{
    constructor(props: FeedBackProps) {
        props = props || {
            RoundName: null,
            Blurb: null,
            Scores: null,
            TeamId: null,
            User: null
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

            {this.props.Blurb && <Segment
                raised
                className="feed-back-blurb"
            >
                <Label color='blue' attached="top left">
                    <Icon size='big' name="lightbulb outline" /> Final Thoughts
                </Label>
                <p style={{ marginTop: '2.5em' }}>{this.props.Blurb}</p>
            </Segment>}
        </Column>
    }

}