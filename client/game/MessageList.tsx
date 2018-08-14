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
                {this.props.Messages && this.props.Messages.filter(m => m._id).reverse().map((m, i) => <List.Item
                    key={i}
                    className={!m.IsRead ? "bold" : "read"}
                >
                    <List.Content
                        onClick={e => this.props.SelectFunc(m)}
                    >
                        {m.Title && <List.Header>{m.Title}</List.Header>}
                        {!m.Title && <List.Header>{this._stripHtml(m.Content).slice(0, 40) + "..."}</List.Header>}
                    </List.Content>
                
                </List.Item>)}
            </List>
            
        </div>
    }

}