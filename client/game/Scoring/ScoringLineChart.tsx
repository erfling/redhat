import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List, Segment, Table, } from 'semantic-ui-react'
const { Column, Row } = Grid;
import FeedBackModel from '../../../shared/models/FeedBackModel';
import { times, groupBy } from 'lodash';
import MathUtil from "../../../shared/entity-of-the-state/MathUtil";
import { sortBy } from 'lodash';

import TeamModel from "../../../shared/models/TeamModel";
import SubRoundScore from "../../../shared/models/SubRoundScore";

interface ChartingProps {
  Scores: SubRoundScore[];
  TeamId: string;
  PlayerId: string;
  YAxisDomain?: number;
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

interface ScoreState {
  componentWidth: number;
  showToolTip: boolean;
  roundScores: any;
  opacity: any;
  RoundDetailScores: SubRoundScore[];
  RoundRanking: SubRoundScore[];
  CumulativeRanking: SubRoundScore[];
}

export default class ScoringLineChart extends React.Component<ChartingProps, ScoreState>
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
    this.state = { showToolTip: false, 
      componentWidth: initialWidth - 100, 
      roundScores: null, 
      opacity: {}, 
      RoundDetailScores: null, 
      RoundRanking: null,
      CumulativeRanking: null
    };

    //wait and trigger resize even to size charts properly
    setTimeout(() => {
      var evt = window.document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }, 500)
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.Scores && this.props.TeamId && (!prevProps.Scores || this.props.Scores != prevProps.Scores)) {
      this.setState({RoundDetailScores: this.getCurrentRoundTeamScores(this.props.Scores, this.props.TeamId)})
      this.setState({RoundRanking: this.getRoundRanking(this.props.Scores)});
      this.setState({CumulativeRanking: this.getCumulativeTeamScores(this.props.Scores)})
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    let elem = document.body.querySelector(".line-chart-wrapper");
    let targetWidth = elem ? elem.clientWidth : window.innerWidth - 100;
    this.setState({ componentWidth: targetWidth });
  }

  static places = ["1st", "2nd", "3rd", "4th", "5th", "6th", "8th", "9th", "10th", "11th", "12th"]
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
        ScoringLineChart.MockTeams.forEach(t => roundDatum[t.Name] = MathUtil.roundTo(t.Score, 0) * i + (Math.floor(Math.random() * 20)));
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

  //static YDomains = [20, 30, 50, ]

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

  getCurrentRoundTeamScores(scores: SubRoundScore[], teamId: string) {
    let selectedRoundScores = scores.filter(rs => rs.TeamId == teamId && rs.RoundLabel == Math.max(...Object.keys(groupBy(this.props.Scores, "RoundLabel")).map(k => Number(k))).toString())
    return selectedRoundScores;
  }

  getRoundRanking(scores: SubRoundScore[]) {
    let selectedRoundScores = scores.filter(rs => rs.RoundLabel == Math.max(...Object.keys(groupBy(this.props.Scores, "RoundLabel")).map(k => Number(k))).toString())
    
    let groupedTeamScores = groupBy(selectedRoundScores, "TeamId")
    

    let accumulatedScores = Object.keys( groupedTeamScores ).map(k => {
      let accumulatedScore = new SubRoundScore();
      accumulatedScore.TeamId = k;
      accumulatedScore.TeamLabel = groupedTeamScores[k][0].TeamLabel;
      accumulatedScore.NormalizedScore = groupedTeamScores[k].reduce((totalScore, srs) => {
        return totalScore + srs.NormalizedScore;
      },0) / groupedTeamScores[k].length; 
      return accumulatedScore;
    })
    selectedRoundScores = sortBy(accumulatedScores, "NormalizedScore")
    return selectedRoundScores.reverse();
  }

  getCumulativeTeamScores(scores: SubRoundScore[]) {

    let groupedTeamScores = groupBy(scores,"TeamId");

    let accumulatedScores = Object.keys( groupedTeamScores ).map(k => {
      let accumulatedScore = new SubRoundScore();
      accumulatedScore.TeamId = k;
      accumulatedScore.TeamLabel = groupedTeamScores[k][0].TeamLabel;
      accumulatedScore.NormalizedScore = groupedTeamScores[k].reduce((totalScore, srs) => {
        return totalScore + srs.NormalizedScore;
      },0) / groupedTeamScores[k].length; 
      return accumulatedScore;
    })

    return sortBy(accumulatedScores, "NormalizedScore").reverse();
  }

  getLineChartData() {
    if (this.props.Scores) {

      //get the scores round by round
      let roundScores = groupBy(this.props.Scores, "RoundLabel");

      let finalScores = [];
      Object.keys(roundScores).forEach(k => {

        let scoreRow = {
          name: "Rnd " + k
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

  static POSITIONS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh"];

  //TODO: mobile tooltip stuff
  render() {
    const { Scores, TeamId } = this.props;
    const { RoundDetailScores, RoundRanking, CumulativeRanking} = this.state;
    const chartXLabels: string[] = ScoringLineChart.rounds;
    const colors = ["#3b67c5", "#cd4c2d", "#f29e3c", "#499535", "#fff", "#00b5ad"];

    return <Column
      width={16}
      className="feedback chart-wrapper"
    >
      {Scores && TeamId && RoundDetailScores && <Segment
        raised
      >
        <Header 
          as="h1" 
          textAlign="center"
        >
          Your Scores
        </Header>
        <Table
          celled
          inverted
          color="blue"
        >
          <Table.Header>
            <Table.HeaderCell>
              Round
          </Table.HeaderCell>
            <Table.HeaderCell>
              Score
          </Table.HeaderCell>
          </Table.Header>
          <Table.Body>
            {sortBy(RoundDetailScores, "SubRoundNumber").map((srs, i) => {
              return <Table.Row
                key={i}
              >
                <Table.Cell>
                  {srs.SubRoundLabel}
                </Table.Cell>
                <Table.Cell>
                  {srs.NormalizedScore && MathUtil.roundTo(srs.NormalizedScore, 0)}%
              </Table.Cell>
              </Table.Row>
            })}
            {this.state.RoundDetailScores && this.state.RoundDetailScores.length > 1 &&
            <Table.Row 
              active
            >
              <Table.Cell className="bold">Average Score</Table.Cell>
              <Table.Cell>{MathUtil.roundTo(RoundDetailScores.reduce((total, srs) => { return total += srs.NormalizedScore }, 0) / RoundDetailScores.length, 0)}%</Table.Cell>
            </Table.Row>
            }
          </Table.Body>
        </Table>
      </Segment>
      }

      {this.state.RoundRanking && this.state.RoundRanking.length &&
        <Segment
          raised  
        >
          <Header
            textAlign="center"
            as="h1"
          >
            Round Ranking
          </Header>

          <Table
            celled  
            color="blue"
            inverted   
          >
            <Table.Header>
              <Table.HeaderCell>Place</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell>Score</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {this.state.RoundRanking && this.state.RoundRanking.map((srs, i) => {
                return <Table.Row
                  key={i}
                  active={srs.TeamId == TeamId}
                >
                  <Table.Cell>
                    {ScoringLineChart.POSITIONS[i]}
                  </Table.Cell>
                  <Table.Cell>
                    {srs.TeamLabel}
                  </Table.Cell>
                  <Table.Cell>
                    {MathUtil.roundTo(srs.NormalizedScore, 0)}%
                  </Table.Cell>
                </Table.Row>
              })}
            </Table.Body>
          </Table>
        </Segment>
      }

      {this.state.CumulativeRanking && this.state.CumulativeRanking.length &&
        <Segment
          raised
        >
          <Header
            textAlign="center"
            as="h1"
          >
            Cumulative Ranking
          </Header>

          <Table
            celled
            inverted
            color="blue"
          >
            <Table.Header>
              <Table.HeaderCell>Place</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell>Score</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {this.state.CumulativeRanking && this.state.CumulativeRanking.map((srs, i) => {
                return <Table.Row
                  key={i}
                  active={srs.TeamId == TeamId}
                >
                  <Table.Cell>
                    {ScoringLineChart.POSITIONS[i]}
                  </Table.Cell>
                  <Table.Cell>
                    {srs.TeamLabel}
                  </Table.Cell>
                  <Table.Cell>
                    {MathUtil.roundTo(srs.NormalizedScore, 0)}%
                  </Table.Cell>
                </Table.Row>
              })}
            </Table.Body>
          </Table>
        </Segment>
      }

    </Column>
  }

}