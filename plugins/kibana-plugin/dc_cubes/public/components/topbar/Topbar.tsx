import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Dropdown, Form, Row, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearchPlus, faClock, faRedoAlt, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons'
import './Topbar.css'
import QuickTimeSelection from './timeselection/QuickTimeSelection';
import DCState from '../../model/DCState'
import DetailTimeSelection from './timeselection/DetailTimeSelection';
// import logo from '../../img/cubes_blor.svg';
import TimeUnit from '../../model/TimeUnit'

interface TopbarProps {
    dataSourceUrl: string
    getLogData: any
    accessChild: any
    sliderMode: 'pointInTime' | 'timespan' | 'hidden'
    temporalAxis: string[]
    timeSeries: Map<string, DCState>
    timeSelectionMode: 'pointInTime' | 'timespan'
    timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
    timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
    timespanAbsoluteTimestampLowerBound: string
    timespanAbsoluteTimestampUpperBound: string
    timespanTimeUnitLowerBound: TimeUnit
    timespanAmountLowerBound: number
    timespanTimeUnitUpperBound: TimeUnit
    timespanAmountUpperBound: number
    pointInTimeTimestamp: string
    updateTimespanData: any
    changeIntervalOfDataRefresh: any
    clearIntervalOfDataRefresh: any
    handlePredictionActivated: any
    handlePredictionDeactivated: any
    prognosisActivated: boolean
    updatePredictions: any
}

interface TopbarState {
    automaticRefresh: boolean
    refreshInterval: any
    refreshTimeUnit: string
}

export default class Topbar extends Component<TopbarProps, TopbarState>
{
    constructor(props: TopbarProps) {
        super(props)
        this.state = {
            refreshInterval: 10,
            refreshTimeUnit: 'minutes',
            automaticRefresh: false,
        }
    }

    render() {
        return (
            <div className="topbar">
                <Link to="/" className="brand-container" style={{ textDecoration: 'none', fontSize: "16px" }}>
                    <span>DC</span>
                    <div id="icon-container">
                        {/* <img src={} alt="DC Cubes" style={{ height: "40px", width: "40px" }} /> */}
                    </div>
                    <span>Cubes</span>
                </Link>
                <Dropdown>
                    <Dropdown.Toggle className="topbar-button gap-topbar" variant="light" id="dropdown-basic">
                        <FontAwesomeIcon icon={faFilter} /> Filter
                     </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle className="topbar-button" variant="light" id="dropdown-basic">
                        <FontAwesomeIcon icon={faSearchPlus} /> Detailstufe
                     </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Server</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Cluster</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Datencenter</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>


                <Form inline style={{ width: "100%" }}>
                    <div className="data-time-select">
                        <Row>
                            <Dropdown>
                                <Dropdown.Toggle className="topbar-button gap-topbar" variant="light" id="dropdown-basic">
                                    <FontAwesomeIcon icon={faClock} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-width">
                                    <QuickTimeSelection accessChild={this.props.accessChild}
                                        sliderMode={this.props.sliderMode}
                                        temporalAxis={this.props.temporalAxis}
                                        timespanTypeLowerBound={this.props.timespanTypeLowerBound}
                                        timespanTypeUpperBound={this.props.timespanTypeUpperBound}
                                        timeSeries={this.props.timeSeries}
                                        refreshInterval={this.state.refreshInterval}
                                        refreshTimeUnit={this.state.refreshTimeUnit}
                                        automaticRefresh={this.state.automaticRefresh}
                                        accessTopbar={this.accessTopbar}
                                        updateTimespanData={this.props.updateTimespanData}
                                        prognosisActivated={this.props.prognosisActivated}
                                        handlePredictionActivated={this.props.handlePredictionActivated}
                                        handlePredictionDeactivated={this.props.handlePredictionDeactivated}
                                    />
                                </Dropdown.Menu>
                            </Dropdown>
                            <DetailTimeSelection timespanTypeLowerBound={this.props.timespanTypeLowerBound}
                                timespanTypeUpperBound={this.props.timespanTypeUpperBound}
                                timespanAbsoluteTimestampLowerBound={this.props.timespanAbsoluteTimestampLowerBound}
                                timespanAbsoluteTimestampUpperBound={this.props.timespanAbsoluteTimestampUpperBound}
                                timespanTimeUnitLowerBound={this.props.timespanTimeUnitLowerBound}
                                timespanAmountLowerBound={this.props.timespanAmountLowerBound}
                                timespanTimeUnitUpperBound={this.props.timespanTimeUnitUpperBound}
                                timespanAmountUpperBound={this.props.timespanAmountUpperBound}
                                refreshInterval={this.state.refreshInterval}
                                refreshTimeUnit={this.state.refreshTimeUnit}
                                automaticRefresh={this.state.automaticRefresh}
                                accessTopbar={this.accessTopbar}
                                updateTimespanData={this.props.updateTimespanData} />
                        </Row>
                    </div>
                </Form>
                <Form>
                    <Button className="topbar-button" variant="light" onClick={this.manualPredictions}>
                        <FontAwesomeIcon icon={faAngleDoubleDown} /> <span>Neue Vorhersagen erstellen</span>
                    </Button>
                </Form>
                <Form>
                    <Button className="topbar-button" variant="light" onClick={this.manualRefresh}>
                        <FontAwesomeIcon icon={faRedoAlt} /> <span>Aktualisieren</span>
                    </Button>
                </Form>
            </div>
        )
    }

    accessTopbar = (stateElement, value) => {
        this.setState<never>({ [stateElement]: value }, () => {

            // Check for udpates of data refresh interval settings
            if (this.state.automaticRefresh === false) {
                this.props.clearIntervalOfDataRefresh()
            } else if ((stateElement === 'refreshInterval' || stateElement === 'refreshTimeUnit') && this.state.automaticRefresh) {
                this.props.changeIntervalOfDataRefresh(this.state.refreshInterval, this.state.refreshTimeUnit)
            } else {
                return
            }
        })
    }

    manualRefresh = () => {
        this.props.getLogData(this.props.dataSourceUrl)
    }

    manualPredictions = () => {
        this.props.updatePredictions();
    }
}
