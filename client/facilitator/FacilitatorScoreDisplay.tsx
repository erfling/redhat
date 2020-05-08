import * as React from "react";
import {
  Grid,
  Menu,
  Container,
  Button,
  Form,
  Input,
  Message,
  Label,
  Card,
  Header,
  Segment,
  Table,
} from "semantic-ui-react";
const Field = { Form };
const { Column, Row } = Grid;
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import FacilitatorCtrl, { IFacilitatorDataStore } from "./FacilitatorCtrl";
import ScoringLineChart from "../game/Scoring/ScoringLineChart";
import MathUtil from "../../shared/entity-of-the-state/MathUtil";
import SubRoundScore from "../../shared/models/SubRoundScore";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";
import GameModel from "../../shared/models/GameModel";

interface IFacilitatorScoreDisplayData {
  CumulativeScores: SubRoundScore[];
  RoundScores: SubRoundScore[];
  SubRoundScores: SubRoundScore[];
  CurrentLookup: RoundChangeLookup;
  Game: GameModel;
  Stepped: boolean;
}

export default class FacilitatorSlides extends React.Component<
  IFacilitatorScoreDisplayData,
  {}
> {
  render() {
    const {
      RoundScores,
      Game,
      CurrentLookup,
      CumulativeScores,
      Stepped,
    } = this.props;
    //className={Stepped ? "facilitator-scores" : ""}
    return (
      <>
        <div>
          {/*
        <pre>{JSON.stringify(RoundScores, null, 2)}</pre>
          <pre>{JSON.stringify(CumulativeScores, null, 2)}</pre>*/}
          {RoundScores &&
            ((Game.CurrentRound.SlideNumber != 76 &&
              RoundScores.length &&
              CurrentLookup.RoundScoreIdx != -1) ||
              !Stepped) && (
              <Segment raised>
                <Header textAlign="center" as="h1">
                  Round Ranking
                </Header>
                <Table celled color="blue" inverted unstackable>
                  <Table.Header>
                    <Table.HeaderCell>Place</Table.HeaderCell>
                    <Table.HeaderCell>Team</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                  </Table.Header>
                  <Table.Body>
                    {RoundScores &&
                      RoundScores.map((srs, i) => {
                        return (
                          <Table.Row
                            key={i}
                            className={
                              i < CurrentLookup.RoundScoreIdx && Stepped
                                ? "no-show"
                                : ""
                            }
                          >
                            <Table.Cell>
                              {ScoringLineChart.POSITIONS[i]}
                            </Table.Cell>
                            <Table.Cell>{srs.TeamLabel}</Table.Cell>
                            <Table.Cell>
                              {MathUtil.roundTo(srs.NormalizedScore, 0)}%
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                  </Table.Body>
                </Table>
              </Segment>
            )}

          {CumulativeScores &&
            CumulativeScores.length &&
            (CurrentLookup.RoundScoreIdx == -1 ||
              Game.CurrentRound.SlideNumber == 76 ||
              !Stepped) && (
              <Segment raised>
                <Header textAlign="center" as="h1">
                  {Game.CurrentRound.SlideNumber != 76 && "Cumulative Ranking"}
                  {Game.CurrentRound.SlideNumber == 76 && "Final Ranking"}
                </Header>

                <Table celled color="blue" inverted unstackable>
                  <Table.Header>
                    <Table.HeaderCell>Place</Table.HeaderCell>
                    <Table.HeaderCell>Team</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                  </Table.Header>
                  <Table.Body>
                    {CumulativeScores &&
                      CumulativeScores.map((srs, i) => {
                        return (
                          <Table.Row
                            key={i}
                            className={
                              i < CurrentLookup.CumulativeScoreIdx && Stepped
                                ? "no-show"
                                : ""
                            }
                          >
                            <Table.Cell>
                              {ScoringLineChart.POSITIONS[i]}
                            </Table.Cell>
                            <Table.Cell>{srs.TeamLabel}</Table.Cell>
                            <Table.Cell>
                              {MathUtil.roundTo(srs.NormalizedScore, 0)}%
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                  </Table.Body>
                </Table>
              </Segment>
            )}
        </div>
      </>
    );
  }
}
