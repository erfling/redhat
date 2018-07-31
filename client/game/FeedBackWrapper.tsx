import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../shared/models/FeedBackModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';

interface FeedBackProps {
    RoundName: string;
    Blurb?: string;
    Scores: FeedBackModel[];
    TeamId: string;
}

export default class FeedBackWrapper extends React.Component<FeedBackProps, any>
{
    constructor(props: FeedBackProps) {
        props = props || {
            RoundName: null,
            Blurb: null,
            Scores:null,
            TeamId: null
        }
        super(props);

        this.state = Object.assign(this.props)
    }

    private _stripHtml(htmlString){
        var tmp = document.createElement("DIV");
        tmp.innerHTML = htmlString;
        return tmp.textContent || tmp.innerText || "";
    }

    render() {

        const { RoundName } = this.props

        const {Scores, TeamId} = this.props;

        return <Column
            width={16}
            className="feedback"
        >   
            <Header>
                <Icon name="volume up"/>{RoundName} Feedback
            </Header>

            {this.props.children}

            <Table striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Team</Table.HeaderCell>
                            <Table.HeaderCell>Subround Score</Table.HeaderCell>
                            <Table.HeaderCell>Round Score</Table.HeaderCell>
                            <Table.HeaderCell>Game Score</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {Scores && Scores.map((s, i) =>
                            <Table.Row key={i}>
                                <Table.Cell textAlign="center">
                                        {s.Label}
                                </Table.Cell>
                                <Table.Cell textAlign="right">{s.TotalSubroundScore}</Table.Cell>
                                <Table.Cell textAlign="right">{s.TotalRoundScore}</Table.Cell>
                                <Table.Cell textAlign="right">{s.TotalGameScore}</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            
            {this.props.Blurb && <Segment 
                raised
                className="feed-back-blurb"
            >    
                <Label color='blue' attached="top left">
                    <Icon size='big' name="lightbulb outline"/> Final Thoughts
                </Label>
                <p style={{marginTop: '2.5em'}}>{this.props.Blurb}</p>
            </Segment>}
        </Column>
    }

}