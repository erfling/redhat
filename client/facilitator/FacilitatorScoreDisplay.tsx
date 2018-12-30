import * as React from "react";
import { Grid, Menu, Container, Button, Form, Input, Message, Label, Card, Header, Segment, Table } from 'semantic-ui-react';
const Field = { Form }
const { Column, Row } = Grid;
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import FacilitatorCtrl, { IFacilitatorDataStore } from "./FacilitatorCtrl";
import ScoringLineChart from "../game/Scoring/ScoringLineChart";
import MathUtil from "../../shared/entity-of-the-state/MathUtil";

export default class FacilitatorSlides extends React.Component<{ FacilitatorState: IFacilitatorDataStore, Stepped: boolean }, {}>
{

    render() {

        const { RoundScores, Game, CurrentLookup, CumulativeScores } = this.props.FacilitatorState;
        const Stepped = this.props.Stepped;

        return <>
            <div className="facilitator-scores">
                {RoundScores && ((Game.CurrentRound.SlideNumber != 76 && RoundScores.length && CurrentLookup.RoundScoreIdx != -1) || !Stepped) &&
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
                                {RoundScores && RoundScores.map((srs, i) => {
                                    return <Table.Row
                                        key={i}
                                        className={i < CurrentLookup.RoundScoreIdx ? 'no-show' : ''}
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

                {CumulativeScores && CumulativeScores.length && ((CurrentLookup.RoundScoreIdx == -1 || Game.CurrentRound.SlideNumber == 76) || !Stepped) &&
                    <Segment
                        raised
                    >
                        <Header
                            textAlign="center"
                            as="h1"
                        >
                            {Game.CurrentRound.SlideNumber != 76 && 'Cumulative Ranking'}
                            {Game.CurrentRound.SlideNumber == 76 && 'Final Ranking'}

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
                                {CumulativeScores && CumulativeScores.map((srs, i) => {
                                    return <Table.Row
                                        key={i}
                                        className={i < CurrentLookup.CumulativeScoreIdx ? 'no-show' : ''}
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
            </div>
        </>
    }
}