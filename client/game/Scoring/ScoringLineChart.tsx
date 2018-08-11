import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../../shared/models/FeedBackModel';

import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import ValueObj, { SliderValueObj } from "../../../shared/entity-of-the-state/ValueObj";
import ResponseModel from "../../../shared/models/ResponseModel";
import UserModel, { JobName } from "../../../shared/models/UserModel";
import DataStore from '../../../shared/base-sapien/client/DataStore';
import SubRoundFeedback, { ValueDemomination } from "../../../shared/models/SubRoundFeedback";
import EditableContentBlock from "../../../shared/base-sapien/client/shared-components/EditableContentBlock";
import MessageModel from "../../../shared/models/MessageModel";
import {
    XYPlot,
    XAxis,
    YAxis,
    HorizontalGridLines,
    VerticalGridLines,
    LineSeries,
    DiscreteColorLegend,
    DiscreteColorLegendItem,
    Hint
} from 'react-vis';

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
        const chartXLabels: string[] = ["Short", "Medium", "Long"];
        const colors = ["#3b67c5", "#cd4c2d", "#f29e3c", "#499535"]
        return <Column
            width={16}
            className="feedback"
        >
            <XYPlot
                                width={this.state.BarChartWidth}
                                height={600}
                                colorType="literal"
                                className="bar-chart line-chart"
                                label="Timeframe"
                                style={{
                                    overflow: 'visible'
                                }}
                            >
                                <HorizontalGridLines
                                    tickValues={[2, 4, 6, 8, 10]}
                                    style={{ stroke: '#666' }}
                                />
                                <XAxis
                                    tickValues={[0, 1, 2]}
                                    tickFormat={(tick: number) => chartXLabels[tick]}
                                    style={{ stroke: '#666' }}
                                />
                                <YAxis
                                    tickValues={[2, 4, 6, 8, 10]}
                                />

                                {this.props.Scores && this.props.Scores.map((s, i, arr) => {
                                    return <LineSeries
                                        curve={'curveMonotoneX'}
                                        label="test"
                                        className="chart-line"
                                        color={colors[i]}
                                        data={[].map((v: number, i: number) => { return { x: i, y: v } })}
                                    />
                                })}

                                <LineSeries
                                    label="test"
                                    className="chart-line"
                                    color="rgba(0,0,0,0)"
                                    data={[{ x: 0, y: 0 }, { x: 2, y: 0 }]}
                                />
                                <LineSeries
                                    label="test"
                                    className="chart-line"
                                    color="rgba(0,0,0,0)"
                                    data={[{ x: 0, y: 10 }, { x: 2, y: 10 }]}
                                />
                                <label></label>
                            </XYPlot>
        </Column>
    }

}
/** 
 *  message:  MessageModel | SubRoundFeedback,
    SubRoundId: string;
    onSaveHandler(message: MessageModel, subroundId: string): void;
    IsEditable: boolean, */