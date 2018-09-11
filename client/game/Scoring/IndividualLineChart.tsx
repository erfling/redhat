import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, Message, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../../shared/models/FeedBackModel';
import { times, groupBy } from 'lodash';
import MathUtil from "../../../shared/entity-of-the-state/MathUtil";

import { LineChart, Line, Legend, Tooltip, CartesianGrid, XAxis, YAxis, ReferenceLine, BarChart, Bar } from 'recharts';
import TeamModel from "../../../shared/models/TeamModel";
import SubRoundScore from "../../../shared/models/SubRoundScore";
import { defaultCipherList } from "constants";

interface ChartingProps {
  TeamId: string;
  PlayerId: string;
  Data: any[];
  RawData?: any;
  SubRoundId: string;
  MessageOnEmpty: string;
}

class CustomizedDot extends React.Component<any, any> {
  static Payload;
  componentDidUpdate() {
    CustomizedDot.Payload = this.props.payload;
  }
  render() {
    const { cx, cy } = this.props;
    return (
      <circle cx={cx} cy={cy} r={7} stroke="black" strokeWidth={3} fill="none" />
    );
  }
};

export default class IndividualLineChart extends React.Component<ChartingProps, { componentWidth: number, showToolTip: boolean; roundScores: any; opacity: any }>
{
  constructor(props: ChartingProps) {
    props = props || {
      TeamId: null,
      PlayerId: null,
      SubRoundId: null,
      MessageOnEmpty: null,
      Data: null
    }
    super(props);
    const initialWidth = window.innerWidth > 0 ? window.innerWidth : 500;
    //this.state = //Object.assign(this.props, {showToolTip: false, windowWidth: initialWidth - 100})
    this.state = { showToolTip: false, componentWidth: initialWidth - 100, roundScores: null, opacity: {} };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    let elem = document.body.querySelector(".line-chart-wrapper");
    let targetWidth = elem ? elem.clientWidth : window.innerWidth - 100;
    this.setState({ componentWidth: targetWidth });
  }

  static rounds = ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5"];
  static Colors = ["#499535", "#f29e3c", "#6ad3f1", "#cd4c2d", "#00b5ad", "#3b67c5", "#fff"];

  static MockData;


  mouseOverHandler(d, e) {
    this.setState({ showToolTip: true });
  }

  mouseOutHandler() {

  }

  handleMouseEnter(o) {
    const { dataKey } = o;
    const { opacity } = this.state;

    this.setState({
      opacity: { ...opacity, [dataKey]: 0.5 },
    });
  }

  handleMouseLeave(o) {
    const { dataKey } = o;
    const { opacity } = this.state;

    this.setState({
      opacity: { ...opacity, [dataKey]: 1 },
    });
  }


  getScoreSoFar(teamId, rounds: SubRoundScore[], roundNumber) {
    let score = 0;
    score += rounds.filter((r) => {
      return r.TeamId == teamId && roundNumber >= r.RoundLabel;
    })
      .reduce((score, r: SubRoundScore) => {
        return r.NormalizedScore + score;
      }, 0)

    return score;
  }

  filterTo(Data: any[]) {
    //return Data.filter()
  }

  //TODO: mobile tooltip stuff
  render() {
    const { TeamId, Data, RawData, MessageOnEmpty } = this.props;

    return <Column
      width={16}
      className="feedback chart-wrapper"
    >
      {(!Data || !Data.length) && MessageOnEmpty &&
        <Header
          as="h1"
          icon
        >
          <Icon name='warning' />
          {MessageOnEmpty}
        </Header>
      }
      {Data && Data.length > 0 &&
        <Segment
          raised
        >
          <Header as="h1" style={{ textAlign: "center", paddingTop: '20px' }}>Your Ratings</Header>

          <Table
            inverted
            color="blue"
            striped
            celled
            
          >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Criteria</Table.HeaderCell>
                <Table.HeaderCell>Rating</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            
            {Object.keys(Data[Data.length - 1]).filter(k => k.toLowerCase().indexOf("name") == -1 && Data[Data.length - 1][k]).map(
              (k, i) => <Table.Row key={i}>
                <Table.Cell>{k}</Table.Cell>
                <Table.Cell>{MathUtil.roundTo(Number(Data[Data.length - 1][k]), 1)}</Table.Cell>
              </Table.Row>
            )}

          </Table>
        </Segment>
      }
    </Column>
  }
}


