import React from 'react';
import { Row, Col, Form, Button, Container, Dropdown } from 'react-bootstrap';
import TimespanOrPointInTimeNotAvailable from '../../error/TimespanOrPointInTimeNotAvailable'
import DCState from '../../../model/DCState'
import 'flatpickr/dist/themes/light.css'
import SelectRefreshInterval from './SelectRefreshInterval'

interface QuickTimeSelectionProps {
    accessApp: any
    temporalAxis: string[]
    timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
    timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
    timeSeries: Map<string, DCState>
    automaticRefresh: boolean
    refreshInterval: any
    refreshTimeUnit: string
    accessTopbar: any
    updateTimespanData: any
    predictionActivated: boolean
    handlePredictionActivated: any
    handlePredictionDeactivated: any
}

interface QuickTimeSelectionState {
    timespanAmount: any
    timespanTimeUnit: string
    dataNotAvailableError: boolean
    pointInTimeTimestamp: string
    pointInTimeType: 'absolute' | 'now'
}

export default class QuickTimeSelection extends React.Component<QuickTimeSelectionProps, QuickTimeSelectionState> {

    constructor(props: QuickTimeSelectionProps) {
        super(props)
        this.state = {
            timespanAmount: 10,
            timespanTimeUnit: 'hours',
            dataNotAvailableError: false,
            pointInTimeTimestamp: new Date().toISOString().split('.')[0] + "Z",
            pointInTimeType: 'now'
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
                            label="Vorhersage aktivieren"
                            type="checkbox"
                            id="togglePrediction"
                            name="togglePrediction"
                            checked={this.props.predictionActivated}
                            onChange={this.togglePrediction}
                        />
                    </Col>
                </Row>
                <br />
                <Form.Row>
                    <Col lg={3}>
                        <Form.Control className="gap-refresh-interval" as="select" name="timespanDirection" value={this.props.timespanTypeUpperBound === 'next' ? 'next' : 'last'} onChange={this.handleChangeOfTimespanDirection}>
                            <option value="last">Letzte</option>
                            <option value="next">Nächste</option>
                        </Form.Control>
                    </Col>
                    <Col lg={3}>
                        <Form.Control className="gap-refresh-interval" type="number" name="timespanAmount" min="1" max="9999" value={this.state.timespanAmount} onChange={this.handleLocalChange} />
                    </Col>
                    <Col lg={3}>
                        <Form.Control className="gap-refresh-interval" as="select" name="timespanTimeUnit" value={this.state.timespanTimeUnit} onChange={this.handleLocalChange}>
                            <option value="seconds">Sekunden</option>
                            <option value="minutes">Minuten</option>
                            <option value="hours">Stunden</option>
                            <option value="days">Tage</option>
                        </Form.Control>
                    </Col>
                    <Col lg={3}>
                        <Button className="gap-refresh-interval" onClick={this.handleTimespan}>Anwenden</Button>
                    </Col>
                </Form.Row>
                <Dropdown.Divider />
                <Row>
                    <Col>
                        Aktualisieren alle
                    </Col>
                </Row>
                <br />
                <Row>
                    <SelectRefreshInterval automaticRefresh={this.props.automaticRefresh}
                        handleRefreshChange={this.handleRefreshChange}
                        refreshInterval={this.props.refreshInterval}
                        refreshTimeUnit={this.props.refreshTimeUnit} />
                </Row>
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
                this.props.accessTopbar('timespanTypeUpperBound', 'now')
                this.props.accessApp('predictionActivated', false)
            } else if (value === 'next') {
                stateElement = 'timespanTypeUpperBound'
                this.props.accessTopbar('timespanTypeLowerBound', 'now')
                this.props.accessApp('predictionActivated', true)
            }
        }
        this.props.accessTopbar(stateElement, value)
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

    handleTimespan = () => {
        this.setState({ dataNotAvailableError: false })

        // Check if past or prediction
        if (this.props.timespanTypeUpperBound === 'now') {
            const newTimespanData = {
                timespanTypeLowerBound: 'last',
                timespanAmountLowerBound: this.state.timespanAmount,
                timespanTimeUnitLowerBound: this.state.timespanTimeUnit,
            }
            this.props.updateTimespanData(newTimespanData)

        } else if (this.props.timespanTypeLowerBound === 'now') {
            const newTimespanData = {
                timespanTypeUpperBound: 'next',
                timespanAmountUpperBound: this.state.timespanAmount,
                timespanTimeUnitUpperBound: this.state.timespanTimeUnit,
            }
            this.props.updateTimespanData(newTimespanData)

        } else {
            return
        }
    }

    togglePrediction = (e) => {
        if (e.target.checked) {
            this.props.accessApp('timespanTypeLowerBound', 'now')
            this.props.accessApp('timespanTypeUpperBound', 'next')
            this.props.handlePredictionActivated()
        } else {
            this.props.accessApp('timespanTypeLowerBound', 'last')
            this.props.accessApp('timespanTypeUpperBound', 'now')
            this.props.handlePredictionDeactivated()
        }
    }
}