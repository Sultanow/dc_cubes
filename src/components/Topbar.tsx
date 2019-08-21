import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Navbar, Dropdown, Form, Row, Button, Container, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearchPlus, faClock, faRedoAlt } from '@fortawesome/free-solid-svg-icons'
import './Topbar.css'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/light.css'

interface TopbarProps {
    dataSourceUrl: string
    getLogData: any
    accessChild: any
    temporalAxis: string[]
    sliderMode: 'pointInTime' | 'timespan' | 'hidden'
}

export default class Topbar extends Component<TopbarProps, any>
{
    constructor(props) {
        super(props);
        this.state = {
            selectedPointInTimeTimestamp: '',
            timespanDirection: 'last',
            timespanTimeUnit: 'hours',
            timespanAmount: 10,
            refreshCount: 10,
            refreshTimeUnit: 'minutes',
            automaticRefresh: true,
            dataNotAvailableError: false
        };
    }

    render()
    {
        return (
            <Navbar bg="light" expand="lg">
                <Link to="/"><Navbar.Brand>DC Cubes</Navbar.Brand></Link>
                <Dropdown>
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                        <FontAwesomeIcon icon={faFilter} /> Filter
                     </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                        <FontAwesomeIcon icon={faSearchPlus} /> Detailstufe
                     </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>


                <Form inline>
                    <div className="data-time-select">
                        <Row>
                            <Dropdown>
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                    <FontAwesomeIcon icon={faClock} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-width">
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
                                                    onChange={this.togglePrognosis}
                                                />
                                            </Col> 
                                        </Row>
                                        <br/> 
                                        <Form.Row>
                                            <Col>
                                                <Form.Control as="select" name="timespanDirection" value={this.state.timespanDirection} onChange={this.handleChange}>
                                                    <option value="last">Letzte</option>
                                                    <option value="next">Nächste</option>
                                                </Form.Control>
                                            </Col>
                                            <Col>
                                                <Form.Control type="number" name="timespanAmount" min="1" max="9999" value={this.state.timespanAmount} onChange={this.handleChange}/>
                                            </Col>
                                            <Col>
                                                <Form.Control as="select" name="timespanTimeUnit" value={this.state.timespanTimeUnit} onChange={this.handleChange}>
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
                                                    checked={this.props.sliderMode !== 'hidden'}
                                                    custom
                                                    inline
                                                    label="Slider anzeigen"
                                                    type="checkbox"
                                                    id="custom-inline-checkbox-2"
                                                    onChange={this.changeDisplayOfSlider}
                                                />
                                            </Col> 
                                        </Row>
                                        <br/>
                                        <Form.Row>
                                            <Col> 
                                                <Flatpickr data-enable-time
                                                    options={{static: true, 
                                                            time_24hr: true, 
                                                            enableSeconds: true, 
                                                            dateFormat: "Y-m-d\\TH:i:S\\Z",
                                                            altFormat: "Y-m-d\\ H:i:S\\",
                                                            altInput: true}}
                                                    value={this.state.selectedPointInTimeTimestamp}
                                                    onChange={this.handlePointInTime} name='value'
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
                                                <Form.Control type="number" name="refreshCount" min="1" max="999" value={this.state.refreshCount} onChange={this.handleChange}/>
                                            </Col>
                                            <Col lg={3}>
                                                <Form.Control as="select" name="refreshTimeUnit" value={this.state.refreshTimeUnit} onChange={this.handleChange}>
                                                    <option value="seconds">Sekunden</option>
                                                    <option value="minutes">Minuten</option>
                                                    <option value="hours">Stunden</option>
                                                    <option value="days">Tage</option>
                                                </Form.Control>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Check
                                                    checked
                                                    custom
                                                    inline
                                                    label="Automatisch aktualisieren"
                                                    type="checkbox"
                                                    id="automaticRefresh"
                                                    onChange={this.handleChange}
                                                />
                                            </Col> 
                                        </Row>
                                        <br/>
                                        {
                                            this.state.dataNotAvailableError &&
                                            <div>
                                                <Dropdown.Divider />
                                                <Row>
                                                    <Col>
                                                        <Alert variant="danger">
                                                            Der ausgewählte Zeitpunkt/Zeitrahmen ist leider nicht verfügbar. Bitte aktualisieren Sie die Seite. Eventuell müssen Sie im Menüpunkt Datenquellen die Query anpassen.
                                                        </Alert>
                                                    </Col>
                                                </Row> 
                                            </div>
                                        }  
                                    </Container>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Dropdown>
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                    Jetzt
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Navbar.Brand>bis</Navbar.Brand>
                            <Dropdown>
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                    Jetzt
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown> 
                        </Row>
                    </div>
                </Form>

                <Button variant="light" onClick={this.refresh}><FontAwesomeIcon icon={faRedoAlt} /> Aktualisieren</Button>

            </Navbar>
        )
    }

    refresh = () => {
        this.props.getLogData(this.props.dataSourceUrl)
    }

    handleChange = (e) => {       
        const stateElement = e.target.name
        const value = e.target.value
        this.setState<never>({ [stateElement]: value }); 
    }

    setCurrentTime = () => {
        let now = new Date()
        const current = now.toISOString().split('.')[0]+"Z"
        this.setState({selectedPointInTimeTimestamp: current})
    }

    handleTimespan = () => {
        this.setState({dataNotAvailableError: false})
        this.props.accessChild('sliderMode', 'timespan')

        if (this.state.timespanDirection === 'last') {
            let now = new Date()

            if (this.state.timespanTimeUnit === 'seconds') {
                now.setSeconds(now.getSeconds() - this.state.timespanAmount)
                now.setUTCMilliseconds(0)
            } else if (this.state.timespanTimeUnit === 'minutes') {
                now.setMinutes(now.getMinutes() - this.state.timespanAmount)
                now.setUTCSeconds(0, 0)
            } else if (this.state.timespanTimeUnit === 'hours') {
                now.setHours(now.getHours() - this.state.timespanAmount)
                now.setUTCMinutes(0, 0, 0)
            } else if (this.state.timespanTimeUnit === 'days') {
                now.setDate(now.getDate() - this.state.timespanAmount)
                now.setUTCHours(0, 0, 0, 0)
            } else {
                return
            }

            let startDatetimeOfTimespan = now.toISOString().split('.')[0]+"Z"

            let startPointOfTimespan = this.getPointInTimeOfDatetimeString(startDatetimeOfTimespan)

            let endPointOfTimespan = this.props.temporalAxis.length - 1

            if (startPointOfTimespan !== -1) {
                this.props.accessChild('selectedTimespan', [startPointOfTimespan, endPointOfTimespan])
            } else {
                this.setState({dataNotAvailableError: true})
            }
        }
    }

    getPointInTimeOfDatetimeString(datetimeString: string) {
        return this.props.temporalAxis.indexOf(datetimeString)
    }

    handlePointInTime = (e) => {
        if (e[0]) {
            this.setState({
                dataNotAvailableError: false,
                selectedPointInTimeTimestamp: e[0].toISOString().split('.')[0]+"Z"
            })
        } else {
            this.props.accessChild('sliderMode', 'pointInTime')
            let pointInTime = this.getPointInTimeOfDatetimeString(this.state.selectedPointInTimeTimestamp)
    
            if (pointInTime !== -1) {
                this.props.accessChild('selectedPointInTime', pointInTime)
            } else {
                this.setState({dataNotAvailableError: true})
            }
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

    }
}
