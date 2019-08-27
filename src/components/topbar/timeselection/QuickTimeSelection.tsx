import React from 'react';
import { Row, Col, Form, Button, Container, Dropdown } from 'react-bootstrap';
import TimespanOrPointInTimeNotAvailable from '../../error/TimespanOrPointInTimeNotAvailable'
import DCState from '../../../model/DCState'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/light.css' 

interface QuickTimeSelectionProps {
    accessChild: any
    sliderMode: 'pointInTime' | 'timespan' | 'hidden'
    temporalAxis: string[]
    timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
    timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
    timeSeries: Map<string, DCState>
    automaticRefresh: boolean
    refreshInterval: any
    refreshTimeUnit: string
    accessTopbar: any
    updateTimespanData: any
}

interface QuickTimeSelectionState {
    timespanAmount: any
    timespanTimeUnit: string
    dataNotAvailableError: boolean
    selectedPointInTimeTimestamp: string
}

export default class QuickTimeSelection extends React.Component<QuickTimeSelectionProps, QuickTimeSelectionState> {

    constructor(props: QuickTimeSelectionProps) {
        super(props)
        this.state = {
            timespanAmount: 10,
            timespanTimeUnit: 'hours',
            dataNotAvailableError: false,
            selectedPointInTimeTimestamp: new Date().toISOString().split('.')[0]+"Z",
        }
      }

    render() {
        return (
            <Container> 
                <Row>
                    <Col>
                        Schnellwahl Zeitraum
                    </Col> 
                    <Col>
                        <Form.Check
                            custom
                            inline
                            label="Prognose aktivieren"
                            type="checkbox"
                            id="togglePrognosis"
                            name="togglePrognosis"
                            checked={this.props.timespanTypeUpperBound === 'next' ? true : false}
                            onChange={this.togglePrognosis}
                        />
                    </Col> 
                </Row>
                <br/> 
                <Form.Row>
                    <Col>
                        <Form.Control as="select" name="timespanDirection" value={this.props.timespanTypeUpperBound === 'next' ? 'next' : 'last'} onChange={this.handleChangeOfTimespanDirection}>
                            <option value="last">Letzte</option>
                            <option value="next">Nächste</option>
                        </Form.Control>
                    </Col>
                    <Col>
                        <Form.Control type="number" name="timespanAmount" min="1" max="9999" value={this.state.timespanAmount} onChange={this.handleLocalChange}/>
                    </Col>
                    <Col>
                        <Form.Control as="select" name="timespanTimeUnit" value={this.state.timespanTimeUnit} onChange={this.handleLocalChange}>
                            <option value="seconds">Sekunden</option>
                            <option value="minutes">Minuten</option>
                            <option value="hours">Stunden</option>
                            <option value="days">Tage</option>
                        </Form.Control>
                    </Col>
                    <Col>
                        <Button onClick={this.handleTimespan}>Anwenden</Button>
                    </Col>
                </Form.Row>
                <Dropdown.Divider />
                <Row>
                    <Col>
                        Schnellwahl Zeitpunkt
                    </Col> 
                    <Col>
                        <Form.Check
                            custom
                            inline
                            label="Slider anzeigen"
                            type="checkbox"
                            id="changeDisplayOfSlider"
                            checked={this.props.sliderMode !== 'hidden'}
                            onChange={this.changeDisplayOfSlider}
                        />
                    </Col> 
                </Row>
                <br/>
                <Form.Row>
                    <Col> 
                        <Flatpickr  
                            data-enable-time
                            options={{static: true, 
                                    time_24hr: true, 
                                    enableSeconds: true, 
                                    minuteIncrement: 1,
                                    dateFormat: "Y-m-d\\TH:i:S\\Z",
                                    altFormat: "Y-m-d\\ H:i:S\\",
                                    altInput: true}}
                            value={this.state.selectedPointInTimeTimestamp}
                            onChange={this.updatePointInTime} 
                            name='value' 
                        />  
                    </Col>
                    <Col>
                        <Button onClick={this.setCurrentTime}>Jetzt</Button>
                    </Col>
                    <Col>
                        <Button onClick={this.handlePointInTime}>Anwenden</Button>
                    </Col>
                </Form.Row>
                <Dropdown.Divider />
                <Row>
                    <Col>
                        Aktualisieren alle
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col lg={3}>
                        <Form.Control type="number" name="refreshInterval" min="1" max="999" value={this.props.refreshInterval} onChange={this.handleRefreshChange}/>
                    </Col>
                    <Col lg={3}>
                        <Form.Control as="select" name="refreshTimeUnit" value={this.props.refreshTimeUnit} onChange={this.handleRefreshChange}>
                            <option value="seconds">Sekunden</option>
                            <option value="minutes">Minuten</option>
                            <option value="hours">Stunden</option>
                        </Form.Control>
                    </Col>
                    <Col lg={6}>
                        <Form.Check
                            custom
                            inline
                            label="Automatisch aktualisieren"
                            type="checkbox"
                            id="automaticRefresh"
                            name="automaticRefresh"
                            checked={this.props.automaticRefresh}
                            onChange={this.handleRefreshChange}
                        />
                    </Col> 
                </Row>
                <br/>
                {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}  
            </Container>
        )
    }

    handleChangeOfTimespanDirection = (e) => {       
        let element = e.target.name
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        let stateElement

        if (element === 'timespanDirection') {
            if (value === 'last') {
                stateElement = 'timespanTypeLowerBound'
                this.props.accessChild('timespanTypeUpperBound', 'now')
            } else if (value === 'next') {
                stateElement = 'timespanTypeUpperBound'
                this.props.accessChild('timespanTypeLowerBound', 'now')
            }
        }
        this.props.accessChild(stateElement, value)
    }

    handleLocalChange = (e) => {
        const stateElement = e.target.name
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

        this.setState<never>({ [stateElement]: value })
    }

    handleRefreshChange = (e) => {
        const stateElement = e.target.name
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

        this.props.accessTopbar(stateElement, value)
    }

    setCurrentTime = () => {
        //let now = new Date()
        //const current = now.toISOString().split('.')[0]+"Z"
        this.setState({selectedPointInTimeTimestamp: 'now'})
    }

    handleTimespan = () => {
        this.setState({dataNotAvailableError: false})

        // Check if past or prognosis
        if (this.props.timespanTypeUpperBound === 'now') {
            const newTimespanData = {
                timeSelectionMode: 'timespan',
                sliderMode: 'timespan',
                timespanTypeLowerBound: 'last',
                timespanAmountLowerBound: this.state.timespanAmount,
                timespanTimeUnitLowerBound: this.state.timespanTimeUnit,
            }
            this.props.updateTimespanData(newTimespanData)

        } else if (this.props.timespanTypeLowerBound === 'now') {
            const newTimespanData = {
                timeSelectionMode: 'timespan',
                sliderMode: 'timespan',
                timespanTypeUpperBound: 'next',
                timespanAmountUpperBound: this.state.timespanAmount,
                timespanTimeUnitUpperBound: this.state.timespanTimeUnit,
            }
            this.props.updateTimespanData(newTimespanData)

        } else {
            return
        }
    }

    getPointInTimeOfDatetimeString = (datetimeString: string) => {
        return this.props.temporalAxis.indexOf(datetimeString)
    }

    updatePointInTime = (e) => {
        this.setState({dataNotAvailableError: false})

        // Check if new date is selected
        if (e[0]) {
            this.setState({
                dataNotAvailableError: false,
                selectedPointInTimeTimestamp: e[0].toISOString().split('.')[0]+"Z"
            }, () => {
                this.props.accessChild('pointInTimeTimestamp', this.state.selectedPointInTimeTimestamp)
                let selectedPointInTime = this.getPointInTimeOfDatetimeString(this.state.selectedPointInTimeTimestamp)

                if (selectedPointInTime === -1) {
                    this.setState({dataNotAvailableError: true})
                }
            })
        }
    }

    handlePointInTime = () => {
        this.setState({dataNotAvailableError: false})
        this.props.accessChild('timeSelectionMode', 'pointInTime')
        
        let selectedPointInTime
        if (this.state.selectedPointInTimeTimestamp === 'now') {
            selectedPointInTime = this.props.temporalAxis.length - 1
        } else {
            selectedPointInTime = this.getPointInTimeOfDatetimeString(this.state.selectedPointInTimeTimestamp)
        }

        if (selectedPointInTime !== -1) {
            this.props.accessChild('sliderMode', 'pointInTime')
            this.props.accessChild('pointInTimeTimestamp', this.state.selectedPointInTimeTimestamp)
            this.props.accessChild('selectedPointInTime', selectedPointInTime)
        } else {
            this.setState({dataNotAvailableError: true})
        }
    }

    changeDisplayOfSlider = (e) => {
        if (e.target.checked) {
            this.props.accessChild('sliderMode', 'pointInTime')
        } else {
            this.props.accessChild('sliderMode', 'hidden')
        }
    }

    togglePrognosis = (e) => {
        if (e.target.checked) {
            this.props.accessChild('timespanTypeLowerBound', 'now')
            this.props.accessChild('timespanTypeUpperBound', 'next')
        } else {
            this.props.accessChild('timespanTypeLowerBound', 'last')
            this.props.accessChild('timespanTypeUpperBound', 'now')
        }
    }
}