import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../../shared/models/FeedBackModel';
import { times, groupBy } from 'lodash';
import MathUtil from "../../../shared/entity-of-the-state/MathUtil";

import { LineChart, Line, Legend, Tooltip, CartesianGrid, XAxis, YAxis, ReferenceLine, BarChart, Bar } from 'recharts';
import TeamModel from "../../../shared/models/TeamModel";
import SubRoundScore from "../../../shared/models/SubRoundScore";

interface ChartingProps {
  Scores: SubRoundScore[];
  TeamId: string;
  PlayerId: string;
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

export default class ScoringLineChart extends React.Component<ChartingProps, { componentWidth: number, showToolTip: boolean; roundScores: any; opacity: any }>
{
  constructor(props: ChartingProps) {
    props = props || {
      Scores: null,
      TeamId: null,
      PlayerId: null
    }
    super(props);
    const initialWidth = window.innerWidth > 0 ? window.innerWidth : 500;
    //this.state = //Object.assign(this.props, {showToolTip: false, windowWidth: initialWidth - 100})
    this.state = { showToolTip: false, componentWidth: initialWidth - 100, roundScores: null, opacity: {} };

    //wait and trigger resize even to size charts properly
    setTimeout(() => {
      var evt = window.document.createEvent('UIEvents'); 
      evt.initUIEvent('resize', true, false, window, 0); 
      window.dispatchEvent(evt);
    },500)
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
  static Colors = ["#3b67c5", "#cd4c2d", "#f29e3c", "#499535", "#fff", "#00b5ad", "#cbeff9"];
  static MappedColors: any;
  static MockTeams = times(7, (i) => {
    let team = Object.assign(new TeamModel(), { Name: "Team " + (i + 1).toString(), _id: i, Color: ScoringLineChart.Colors[i], Score: MathUtil.roundTo((Math.random() * 20) + 2, 2) });
    return team;
  })

  static MockData;

  getMockData() {
    if (!ScoringLineChart.MockData) {
      ScoringLineChart.MockData = times(5, (i) => {
        let roundDatum = {
          name: "Rnd " + (i + 1).toString()
        }
        ScoringLineChart.MockTeams.forEach(t => roundDatum[t.Name] = MathUtil.roundTo(t.Score, 2) * i + (Math.floor(Math.random() * 20)));
        return roundDatum;
      })
    }
    return ScoringLineChart.MockData;
  }

  mouseOverHandler(d, e) {
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

  getTeamColor(teamName) {
    let team = ScoringLineChart.MockTeams.filter(t => t.Name == teamName)[0] || null;
    if (team) return team.Color;
    return "white";
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

  getLineChartData() {
    if (this.props.Scores) {

      //get the scores round by round
      let roundScores = groupBy(this.props.Scores, "RoundLabel");

      let finalScores = [];
      Object.keys(roundScores).forEach(k => {

        let scoreRow = {
          name: k
        }

        roundScores[k].forEach(s => {
          scoreRow[s.TeamLabel] = this.getScoreSoFar(s.TeamId, this.props.Scores, s.RoundLabel)
        })

        finalScores.push(scoreRow);
      })

      return finalScores;

    }
  }

  getBarChartData() {
    if (this.props.Scores) {

      //get the scores round by round
      let roundScores = groupBy(this.props.Scores, "RoundLabel");
      let sortedRounds = Object.keys(roundScores).sort((a, b) => {
        return Number(a > b);
      });

      let mostRecentRound = sortedRounds[0]
      //console.warn("most recent",mostRecentRound, sortedRounds, Array.isArray(sortedRounds));
      let scoreRow: any = {
        name: "Round " + mostRecentRound
      };

      let groupedTeamScores = groupBy(roundScores[mostRecentRound], "TeamLabel");
      Object.keys(groupedTeamScores).forEach(k => {
        scoreRow[k] = MathUtil.roundTo(groupedTeamScores[k].reduce((score, teamScoreObj) => {
          return score + teamScoreObj.NormalizedScore
        }, 0), 2)//this.getScoreSoFar(groupedTeamScores[k][0].TeamId, roundScores[mostRecentRound], mostRecentRound);
      })


      // return roundScores[mostRecentRound];
      return [scoreRow];
    }
  }

  //TODO: mobile tooltip stuff
  render() {
    const { Scores, TeamId } = this.props;
    const chartXLabels: string[] = ScoringLineChart.rounds;
    const colors = ["#3b67c5", "#cd4c2d", "#f29e3c", "#499535", "#fff", "#00b5ad"];

    return <Column
      width={16}
      className="feedback chart-wrapper"
    >
      {this.getLineChartData().length && this.getLineChartData().length == 1 && this.getBarChartData() &&
        <Segment
          style={{ paddingLeft: 0 }}
          raised
          className="line-chart-wrapper"
        >
          <Header
            textAlign="center"
          >
            {this.getBarChartData()[0].name} Scores
          </Header>

          <BarChart
            data={this.getBarChartData()}
            barCategoryGap={15}
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            width={this.state.componentWidth - 20}
            height={this.state.componentWidth / 1.5}            
          >
            <XAxis padding={{ left: 0, right: 10 }} label="Round 1"/>
            <YAxis padding={{ top: 10, bottom: 0 }} domain={[0, 20]} />
            <Legend verticalAlign="bottom" height={100} />
            {Object.keys(this.getBarChartData()[0]).filter(k => k.toLowerCase().indexOf("team") != -1).map(k => {
              return <Bar isAnimationActive={false} dataKey={k} fill={this.getTeamColor(k)} label />
            })}

          </BarChart>
        </Segment>
      }

      {this.getLineChartData().length && this.getLineChartData().length > 1 &&

        <Segment
          style={{ paddingLeft: 0 }}
          raised
          className="line-chart-wrapper"
        >
          <Header
            textAlign="center"
          >
            Round by round Scores
          </Header>
          <Row className="mobile-tooltip">
            <ul>
              {this.state.roundScores && Object.keys(this.state.roundScores).sort((a, b) => {
                let sortVal = 0;
                if (this.state.roundScores[a] > this.state.roundScores[b]) {
                  sortVal = -1;
                } else if (this.state.roundScores[a] < this.state.roundScores[b]) {
                  sortVal = 1;
                }
                return sortVal;
              }).map((k, i) => {
                return <li
                >
                  {k == "name" &&
                    <h2>Scores Through Round {this.state.roundScores["name"]}</h2>
                  }

                  {k != "name" &&
                    <Label style={{ background: i == 0 ? 'transparent' : this.getTeamColor(k), border: 'none', fontWeight: 'bold' }}>
                      {i}. {k.toUpperCase()}: {MathUtil.roundTo(this.state.roundScores[k], 2)}
                    </Label>
                  }
                </li>
              })
              }
            </ul>
          </Row>

          <LineChart
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            width={this.state.componentWidth - 20}
            height={this.state.componentWidth / 1.5}
            data={this.getLineChartData()}
          >
            <XAxis padding={{ left: 0, right: 20 }} />
            <YAxis padding={{ top: 10, bottom: 0 }} domain={[0, 20]} />
            <Legend verticalAlign="bottom" height={100} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
            <Tooltip wrapperStyle={{ display: 'none' }} />
            {this.state.roundScores && <ReferenceLine x={this.state.roundScores.name} stroke="white" strokeWidth={2} strokeDasharray="3 1" opacity={.5} />}
            {this.getLineChartData().map((d, i) => {
              return <Line
                opacity={this.state.opacity ? this.state.opacity[ScoringLineChart.MockTeams[i].Name] : .75}
                animationDuration={750}
                animationEasing="ease"
                key={i}
                dataKey={"Team " + (i + 1).toString()}
                stroke={this.getTeamColor(Object.keys(d)[i + 1])}
                activeDot={(d, i) => {
                  this.setState({ roundScores: d.payload });
                }}
              />
            })}
          </LineChart>

        </Segment>
      }

    </Column>
  }

}