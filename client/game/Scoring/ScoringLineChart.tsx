import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../../shared/models/FeedBackModel';
import { times } from 'lodash';
import Inbox from '-!svg-react-loader?name=Icon!../img/inbox.svg';
import ValueObj, { SliderValueObj } from "../../../shared/entity-of-the-state/ValueObj";
import ResponseModel from "../../../shared/models/ResponseModel";
import UserModel, { JobName } from "../../../shared/models/UserModel";
import DataStore from '../../../shared/base-sapien/client/DataStore';
import SubRoundFeedback, { ValueDemomination } from "../../../shared/models/SubRoundFeedback";
import EditableContentBlock from "../../../shared/base-sapien/client/shared-components/EditableContentBlock";
import MessageModel from "../../../shared/models/MessageModel";
import MathUtil from "../../../shared/entity-of-the-state/MathUtil";

import { LineChart, Line, Legend, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import TeamModel from "../../../shared/models/TeamModel";

interface FeedBackProps {
  RoundName: string;
  Blurb?: string;
  Scores: FeedBackModel[];
  TeamId: string;
  User?: UserModel;
  Feedback?: SubRoundFeedback[];
  Message?: MessageModel | SubRoundFeedback,
  SubRoundId?: string;
  onSaveHandler?(message: MessageModel, subroundId: string): void;
  IsEditable?: boolean,
}

export default class ScoringLineChart extends React.Component<any, { componentWidth: number, showToolTip: boolean }>
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
    const initialWidth = window.innerWidth > 0 ? window.innerWidth : 500;
    //this.state = //Object.assign(this.props, {showToolTip: false, windowWidth: initialWidth - 100})
    this.state = { showToolTip: false, componentWidth: initialWidth - 100 };
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
  static MockTeams = times(5, (i) => Object.assign(new TeamModel(), { Name: "Team " + (i + 1).toString() }))
  static MockData;

  getMockData() {
    if (!ScoringLineChart.MockData) {
      ScoringLineChart.MockData = times(5, (i) => {
        console.error(i);

        let roundDatum = {
          name: "Rnd " + (i + i).toString()
        }
        ScoringLineChart.MockTeams.forEach(t => roundDatum[t.Name] = MathUtil.roundTo(Math.random() * 20, 1))
        return roundDatum;
      })
    }
    return ScoringLineChart.MockData;
    /*
      return [
          [
            {
              MaxScore: 20,
              Score: 16.68
            },
            {
              MaxScore: 20,
              Score: 10.75
            },
            {
              MaxScore: 20,
              Score: 15.84
            },
            {
              MaxScore: 20,
              Score: 13.9
            },
            {
              MaxScore: 20,
              Score: 13.88
            },
            {
              MaxScore: 20,
              Score: 12.21
            }
          ],
          [
            {
              MaxScore: 20,
              Score: 1.86
            },
            {
              MaxScore: 20,
              Score: 0.25
            },
            {
              MaxScore: 20,
              Score: 16.31
            },
            {
              MaxScore: 20,
              Score: 7.75
            },
            {
              MaxScore: 20,
              Score: 4.88
            },
            {
              MaxScore: 20,
              Score: 14.48
            }
          ],
          [
            {
              MaxScore: 20,
              Score: 13.06
            },
            {
              MaxScore: 20,
              Score: 2.44
            },
            {
              MaxScore: 20,
              Score: 18.52
            },
            {
              MaxScore: 20,
              Score: 16.6
            },
            {
              MaxScore: 20,
              Score: 12.73
            },
            {
              MaxScore: 20,
              Score: 13
            }
          ],
          [
            {
              MaxScore: 20,
              Score: 3.67
            },
            {
              MaxScore: 20,
              Score: 5.27
            },
            {
              MaxScore: 20,
              Score: 14.48
            },
            {
              MaxScore: 20,
              Score: 13.79
            },
            {
              MaxScore: 20,
              Score: 2.54
            },
            {
              MaxScore: 20,
              Score: 0.01
            }
          ],
          [
            {
              MaxScore: 20,
              Score: 4.22
            },
            {
              MaxScore: 20,
              Score: 4.77
            },
            {
              MaxScore: 20,
              Score: 0.26
            },
            {
              MaxScore: 20,
              Score: 10.85
            },
            {
              MaxScore: 20,
              Score: 6.92
            },
            {
              MaxScore: 20,
              Score: 19
            }
          ]
        ].map((s, i) => {
          return s.map((score, j) => {
            return {
              x: ScoringLineChart.rounds[j],
              y: score.Score,
              teamName: "Team " + (i + 1).toString()
            }
        })
      })*/
  }

  mouseOverHandler(d, e) {
    console.log(d, e);
    this.setState({ showToolTip: true });

    /*
    this.setState({
      showToolTip: true,
      top: `${e.screenY - 10}px`,
      left: `${e.screenX + 10}px`,
      y: d.y,
      x: d.x});*/
  }

  mouseOutHandler() {

  }
  //TODO: mobile tooltip stuff
  render() {

    const { Scores, TeamId } = this.props;
    const chartXLabels: string[] = ScoringLineChart.rounds;
    const colors = ["#3b67c5", "#cd4c2d", "#f29e3c", "#499535", "#fff", "#00b5ad"]
    return <Column
      width={16}
      className="feedback chart-wrapper"
    >
      <Segment
        style={{paddingLeft: 0}}
        raised
        className="line-chart-wrapper"
      >
        <Header
          textAlign="center"
        >
          Round by round Scores
        </Header>


        <LineChart
          margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
          width={this.state.componentWidth - 20}
          height={this.state.componentWidth / 1.5}
          data={this.getMockData()}          
        >        
          <XAxis padding={{left: 0, right: 20}} dataKey="name" />
          <YAxis padding={{top:10, bottom:0}}/>
          <Legend verticalAlign="bottom" height={100}/>
          <Tooltip/>
          {this.getMockData().map((d, i) => <Line
            key={i}
            dataKey={ScoringLineChart.MockTeams[i].Name}
            stroke={colors[i]}
            activeDot={(d,i) => {console.warn(d,i)}}

          />)}
        </LineChart>

      </Segment>

    </Column>
  }

}
/** onMouseEnter={this.mouseOverHandler.bind(this)}
          onMouseLeave={() => this.setState({ showToolTip: false })}
 * <Legend
                data={this.getMockData().reduce(function(prev, curr) {
                  return prev.concat(curr[0]);
                })}
                config={colors.map(c => {return {color: c}})}
                dataId="teamName"
                horizontal
              />
 * 
 * ={(this.state.componentWidth) > 350 ? true : false}
 *  message:  MessageModel | SubRoundFeedback,
    SubRoundId: string;
    onSaveHandler(message: MessageModel, subroundId: string): void;
    IsEditable: boolean,  <HorizontalGridLines
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
                 {this.getMockData().map((s, i, arr) => {
                    return <LineChart
                        label="test"
                        className="chart-line"
                        color={colors[i]}
                        data={s.map((s, i: number) => { return { x: i + 1, y: s.MaxScore } })}
                    />
                })}*/