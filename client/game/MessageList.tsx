import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import MessageModel from '../../shared/models/MessageModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';

interface MessageProps {
    Messages: MessageModel[],
    SelectFunc: (message: MessageModel) => void,
    Show: boolean,
}

export default class MessageList extends React.Component<MessageProps, { Messages: MessageModel }>
{
    constructor(props: MessageProps) {
        props = props || {
            Messages: null,
            SelectFunc: null,
            Show: false
        }
        super(props);

    }

    private _stripHtml(htmlString){
        var tmp = document.createElement("DIV");
        tmp.innerHTML = htmlString;
        return tmp.textContent || tmp.innerText || "";
    }

    render() {
        return <div
            className="mobile-messages-wrapper"
        >   
            <Header>
                <Inbox 
                    className="ui circular image"
                    style={{width:'40px'}}/>Inbox
            </Header>
            <List divided verticalAlign='middle'>
                {this.props.Messages && this.props.Messages.map((m, i) => <List.Item>
                    <List.Content
                        key={i}
                        onClick={e => this.props.SelectFunc(m)}
                        className={!m.IsRead ? "bold" : ""}
                    >
                        {m.Title && <List.Header>{m.Title}</List.Header>}
                        {!m.Title && <List.Header>{this._stripHtml(m.Content).slice(0, 40) + "..."}</List.Header>}
                        <List.Description>{this._stripHtml(m.Content).slice( m.Title ? 0 : 41, m.Title ? 40 : 80 ) + "..."}</List.Description>
                    </List.Content>
                
                </List.Item>)}
            </List>
            
        </div>
    }

}