import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Dropdown, Form, Row, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearchPlus, faClock, faRedoAlt, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons'
import './Topbar.css'
import QuickTimeSelection from './timeselection/QuickTimeSelection';
import DCState from '../../model/DCState'
import DetailTimeSelection from './timeselection/DetailTimeSelection';
import logo from '../../img/cubes_blor.svg';
import TimeUnit from '../../model/TimeUnit'

interface TopbarProps {
    getLogData: any
    accessApp: any
    temporalAxis: string[]
    timeSeries: Map<string, DCState>
    timeSelectionMode: 'pointInTime' | 'timespan'
    timespanAbsoluteTimestampLowerBound: string
    timespanAbsoluteTimestampUpperBound: string
    pointInTimeTimestamp: string
    updateBoundariesForDataRetrieval: any
    changeIntervalOfDataRefresh: any
    clearIntervalOfDataRefresh: any
    handlePredictionActivated: any
    handlePredictionDeactivated: any
    predictionActivated: boolean
    updatePredictions: any
}

interface TopbarState {
    automaticRefresh: boolean
    refreshInterval: any
    refreshTimeUnit: string

    timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
    timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
    timespanTimeUnitLowerBound: TimeUnit
    timespanAmountLowerBound: number
    timespanTimeUnitUpperBound: TimeUnit
    timespanAmountUpperBound: number
    timespanError: boolean
}

export default class Topbar extends Component<TopbarProps, TopbarState>
{
    constructor(props: TopbarProps) {
        super(props)
        this.state = {
            refreshInterval: 10,
            refreshTimeUnit: 'minutes',
            automaticRefresh: false,

            timespanTypeLowerBound: 'last',
            timespanTypeUpperBound: 'now',
            timespanTimeUnitLowerBound: 'days',
            timespanAmountLowerBound: 1000,
            timespanTimeUnitUpperBound: 'minutes',
            timespanAmountUpperBound: 10,
            timespanError: false
        }
    }

    render() {
        return (
            <div className="topbar">
                <Link to="/" className="brand-container" style={{ textDecoration: 'none', fontSize: "16px" }}>
                    <span>DC</span>
                    <div id="icon-container">
                        <img src={logo} alt="DC Cubes" style={{ height: "40px", width: "40px" }} />
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
                                    <QuickTimeSelection 
                                        accessApp={this.props.accessApp}
                                        temporalAxis={this.props.temporalAxis}
                                        timespanTypeLowerBound={this.state.timespanTypeLowerBound}
                                        timespanTypeUpperBound={this.state.timespanTypeUpperBound}
                                        timeSeries={this.props.timeSeries}
                                        refreshInterval={this.state.refreshInterval}
                                        refreshTimeUnit={this.state.refreshTimeUnit}
                                        automaticRefresh={this.state.automaticRefresh}
                                        accessTopbar={this.accessTopbar}
                                        updateTimespanData={this.updateTimespanData}
                                        predictionActivated={this.props.predictionActivated}
                                        handlePredictionActivated={this.props.handlePredictionActivated}
                                        handlePredictionDeactivated={this.props.handlePredictionDeactivated}
                                    />
                                </Dropdown.Menu>
                            </Dropdown>
                            <DetailTimeSelection 
                                timespanTypeLowerBound={this.state.timespanTypeLowerBound}
                                timespanTypeUpperBound={this.state.timespanTypeUpperBound}
                                timespanAbsoluteTimestampLowerBound={this.props.timespanAbsoluteTimestampLowerBound}
                                timespanAbsoluteTimestampUpperBound={this.props.timespanAbsoluteTimestampUpperBound}
                                timespanTimeUnitLowerBound={this.state.timespanTimeUnitLowerBound}
                                timespanAmountLowerBound={this.state.timespanAmountLowerBound}
                                timespanTimeUnitUpperBound={this.state.timespanTimeUnitUpperBound}
                                timespanAmountUpperBound={this.state.timespanAmountUpperBound}
                                refreshInterval={this.state.refreshInterval}
                                refreshTimeUnit={this.state.refreshTimeUnit}
                                automaticRefresh={this.state.automaticRefresh}
                                accessTopbar={this.accessTopbar}
                                updateTimespanData={this.updateTimespanData} />
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
        this.props.getLogData()
    }

    manualPredictions = () => {
        this.props.updatePredictions();
    }

    updateTimespanData = (newTimespanData: object) => {
      console.log(newTimespanData)
      this.setState<never>(newTimespanData, () => {
        this.calculateAndSetBoundariesOfTimespanSlider()
      })
    }

    calculateAndSetBoundariesOfTimespanSlider = () => {
        this.setState({ timespanError: false })

        const typeLowerBound = this.state.timespanTypeLowerBound
        const typeUpperBound = this.state.timespanTypeUpperBound
        let lowerBoundDatetime = this.props.timespanAbsoluteTimestampLowerBound
        let upperBoundDatetime = this.props.timespanAbsoluteTimestampUpperBound
    
        if (typeLowerBound === 'absolute' && typeUpperBound === 'absolute') {
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'absolute' && typeUpperBound === 'last') {
          upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper')
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'absolute' && typeUpperBound === 'next') {
          this.setState({ timespanError: true })
    
        } else if (typeLowerBound === 'absolute' && typeUpperBound === 'now') {
          upperBoundDatetime = new Date().toISOString().split('.')[0] + "Z"
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'last' && typeUpperBound === 'absolute') {
          lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'last' && typeUpperBound === 'last') {
          lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
          upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper')
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'last' && typeUpperBound === 'next') {
          this.setState({ timespanError: true })
    
        } else if (typeLowerBound === 'last' && typeUpperBound === 'now') {
          upperBoundDatetime = new Date().toISOString().split('.')[0] + "Z"
          lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
          this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    
        } else if (typeLowerBound === 'next' && typeUpperBound === 'absolute') {
          this.setState({ timespanError: true })
    
        } else if (typeLowerBound === 'next' && typeUpperBound === 'next') {
          this.setState({ timespanError: true })
    
        } else if (typeLowerBound === 'now' && typeUpperBound === 'absolute') {
          this.setState({ timespanError: true })
    
        } else if (typeLowerBound === 'now' && typeUpperBound === 'next') {
          this.setState({ timespanError: true })
    
        } else {
          this.setState({ timespanError: true })
        }
      } 
    
      getSliderPositions = (lowerBoundDatetime: string, upperBoundDatetime: string) => {
        // Check if lower bound datetime is earlier than upper bound datetime
        if (Date.parse(lowerBoundDatetime) < Date.parse(upperBoundDatetime)) {
          this.props.updateBoundariesForDataRetrieval({ timespanAbsoluteTimestampLowerBound: lowerBoundDatetime, timespanAbsoluteTimestampUpperBound: upperBoundDatetime})
        } else {
          this.setState({ timespanError: true })
        }
      } 
    
      calculateRelativeDatetime = (timespanType, bound: 'lower' | 'upper') => {
        let timespanAmount = bound === 'upper' ? this.state.timespanAmountUpperBound : this.state.timespanAmountLowerBound
        let timespanTimeUnit = bound === 'upper' ? this.state.timespanTimeUnitUpperBound : this.state.timespanTimeUnitLowerBound
        let now = new Date()
    
        if (timespanType === 'last') {
          if (timespanTimeUnit === 'seconds') {
            now.setSeconds(now.getSeconds() - timespanAmount)
            now.setUTCMilliseconds(0)
          } else if (timespanTimeUnit === 'minutes') {
            now.setMinutes(now.getMinutes() - timespanAmount)
            now.setUTCSeconds(0, 0)
          } else if (timespanTimeUnit === 'hours') {
            now.setHours(now.getHours() - timespanAmount)
            now.setUTCMinutes(0, 0, 0)
          } else if (timespanTimeUnit === 'days') {
            now.setDate(now.getDate() - timespanAmount)
            now.setUTCHours(0, 0, 0, 0)
          } else {
            this.setState({ timespanError: true })
            return undefined
          }
          return now.toISOString().split('.')[0] + "Z"
    
        } else if (timespanType === 'next') {
          if (timespanTimeUnit === 'seconds') {
            now.setSeconds(now.getSeconds() + timespanAmount)
            now.setUTCMilliseconds(0)
          } else if (timespanTimeUnit === 'minutes') {
            now.setMinutes(now.getMinutes() + timespanAmount)
            now.setUTCSeconds(0, 0)
          } else if (timespanTimeUnit === 'hours') {
            now.setHours(now.getHours() + timespanAmount)
            now.setUTCMinutes(0, 0, 0)
          } else if (timespanTimeUnit === 'days') {
            now.setDate(now.getDate() + timespanAmount)
            now.setUTCHours(0, 0, 0, 0)
          } else {
            this.setState({ timespanError: true })
            return undefined
          }
          return now.toISOString().split('.')[0] + "Z"
    
        } else {
          this.setState({ timespanError: true })
          return undefined
        }
      }
}
