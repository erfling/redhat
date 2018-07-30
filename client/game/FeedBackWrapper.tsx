import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import MessageModel from '../../shared/models/MessageModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';

interface FeedBackProps {
    RoundName: string;
    Blurb?: string;
}

export default class FeedBackWrapper extends React.Component<FeedBackProps, { Messages: MessageModel }>
{
    constructor(props: FeedBackProps) {
        props = props || {
            RoundName: null,
            Blurb: null
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

        return <Column
            width={16}
            className="feedback"
        >   
            <Header>
                <Icon name="volume up"/>{RoundName} Feedback
            </Header>

            {this.props.children}
            
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