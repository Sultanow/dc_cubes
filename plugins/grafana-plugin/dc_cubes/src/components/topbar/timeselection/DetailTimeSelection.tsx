import React from 'react';
import { Row, Col, Form, Button, Container, Dropdown, Navbar, Tab, Tabs } from 'react-bootstrap';
import TimespanOrPointInTimeNotAvailable from '../../error/TimespanOrPointInTimeNotAvailable';
import Flatpickr from 'react-flatpickr';
//import 'flatpickr/dist/themes/light.css';
import SelectRefreshInterval from './SelectRefreshInterval';
import './DetailTimeSelection.css';

interface DetailTimeSelectionProps {
  timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now';
  timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now';
  timespanAbsoluteTimestampLowerBound: string;
  timespanAbsoluteTimestampUpperBound: string;
  timespanTimeUnitLowerBound: 'seconds' | 'minutes' | 'hours' | 'days';
  timespanAmountLowerBound: any;
  timespanTimeUnitUpperBound: 'seconds' | 'minutes' | 'hours' | 'days';
  timespanAmountUpperBound: any;
  refreshInterval: any;
  refreshTimeUnit: string;
  automaticRefresh: boolean;
  accessTopbar: any;
  updateTimespanData: any;
}

interface DetailTimeSelectionState {
  timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now';
  timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now';
  dataNotAvailableError: boolean;
}

export default class DetailTimeSelection extends React.Component<DetailTimeSelectionProps, DetailTimeSelectionState> {
  constructor(props: DetailTimeSelectionProps) {
    super(props);
    this.state = {
      timespanTypeLowerBound: this.props.timespanTypeLowerBound === 'next' ? 'next' : 'last',
      timespanTypeUpperBound: this.props.timespanTypeUpperBound === 'next' ? 'next' : 'last',
      dataNotAvailableError: false,
    };
  }

  render() {
    let lowerBoundLabel;
    if (this.props.timespanTypeLowerBound === 'absolute') {
      lowerBoundLabel = this.props.timespanAbsoluteTimestampLowerBound;
    } else if (this.props.timespanTypeLowerBound === 'last') {
      lowerBoundLabel = 'vor ' + this.props.timespanAmountLowerBound + ' ' + this.props.timespanTimeUnitLowerBound;
    } else if (this.props.timespanTypeLowerBound === 'next') {
      lowerBoundLabel = 'in ' + this.props.timespanAmountLowerBound + ' ' + this.props.timespanTimeUnitLowerBound;
    } else {
      lowerBoundLabel = 'Jetzt';
    }

    let upperBoundLabel;
    if (this.props.timespanTypeUpperBound === 'absolute') {
      upperBoundLabel = this.props.timespanAbsoluteTimestampUpperBound;
    } else if (this.props.timespanTypeUpperBound === 'last') {
      upperBoundLabel = 'vor ' + this.props.timespanAmountUpperBound + ' ' + this.props.timespanTimeUnitUpperBound;
    } else if (this.props.timespanTypeUpperBound === 'next') {
      upperBoundLabel = 'in ' + this.props.timespanAmountUpperBound + ' ' + this.props.timespanTimeUnitUpperBound;
    } else {
      upperBoundLabel = 'Jetzt';
    }
    return (
      <React.Fragment>
        <Dropdown>
          <Dropdown.Toggle className="topbar-button" variant="light" id="dropdown-basic">
            {lowerBoundLabel}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-width">
            <Tabs defaultActiveKey="absolute" id="timespan_from">
              <Tab eventKey="absolute" title="Absolut">
                <Container>
                  <Col className="detail-time-selection" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Flatpickr
                      data-enable-time
                      options={{
                        static: true,
                        inline: true,
                        time_24hr: true,
                        enableSeconds: true,
                        minuteIncrement: 1,
                        dateFormat: 'Y-m-d\\TH:i:S\\Z',
                        altFormat: 'Y-m-d\\ H:i:S\\',
                        altInput: true,
                      }}
                      value={this.props.timespanAbsoluteTimestampLowerBound}
                      onChange={this.updateAbsoluteLowerBound}
                      name="value"
                    />
                  </Col>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
              <Tab eventKey="relative" title="Relativ">
                <br />
                <Container>
                  <Form.Row>
                    <Col>
                      <Form.Control
                        as="select"
                        name="timespanTypeLowerBound"
                        value={this.state.timespanTypeLowerBound}
                        onChange={this.handleLocalChangeLowerBound}
                      >
                        <option value="last">Letzte</option>
                        <option value="next">Nächste</option>
                      </Form.Control>
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        name="timespanAmountLowerBound"
                        min="1"
                        max="9999"
                        value={this.props.timespanAmountLowerBound}
                        onChange={this.handleChangeLowerBound}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        as="select"
                        name="timespanTimeUnitLowerBound"
                        value={this.props.timespanTimeUnitLowerBound}
                        onChange={this.handleChangeLowerBound}
                      >
                        <option value="seconds">Sekunden</option>
                        <option value="minutes">Minuten</option>
                        <option value="hours">Stunden</option>
                        <option value="days">Tage</option>
                      </Form.Control>
                    </Col>
                  </Form.Row>
                  <Dropdown.Divider />
                  <Row>
                    <Col>Aktualisieren alle</Col>
                  </Row>
                  <br />
                  <Row>
                    <SelectRefreshInterval
                      automaticRefresh={this.props.automaticRefresh}
                      handleRefreshChange={this.handleRefreshChange}
                      refreshInterval={this.props.refreshInterval}
                      refreshTimeUnit={this.props.refreshTimeUnit}
                    />
                  </Row>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
              <Tab eventKey="now" title="Jetzt">
                <Container>
                  <br />
                  <Row>
                    <Col className="text-center">Datum und Uhrzeit werden bei jeder Aktualisierung auf den aktuellen Zeitpunkt gesetzt</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className="text-center">
                      <Button onClick={this.updateNowLowerBound}>Datum und Uhrzeit auf aktuellen Zeitpunkt setzen</Button>
                    </Col>
                  </Row>
                  <Dropdown.Divider />
                  <Row>
                    <Col>Aktualisieren alle</Col>
                  </Row>
                  <br />
                  <Row>
                    <SelectRefreshInterval
                      automaticRefresh={this.props.automaticRefresh}
                      handleRefreshChange={this.handleRefreshChange}
                      refreshInterval={this.props.refreshInterval}
                      refreshTimeUnit={this.props.refreshTimeUnit}
                    />
                  </Row>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
            </Tabs>
          </Dropdown.Menu>
        </Dropdown>
        <Navbar.Text className="gap">bis</Navbar.Text>
        <Dropdown>
          <Dropdown.Toggle className="topbar-button" variant="light" id="dropdown-basic">
            {upperBoundLabel}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-width">
            <Tabs defaultActiveKey="absolute" id="timespan_from">
              <Tab eventKey="absolute" title="Absolut">
                <Container>
                  <Col className="detail-time-selection" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Flatpickr
                      data-enable-time
                      options={{
                        static: true,
                        inline: true,
                        time_24hr: true,
                        enableSeconds: true,
                        minuteIncrement: 1,
                        dateFormat: 'Y-m-d\\TH:i:S\\Z',
                        altFormat: 'Y-m-d\\ H:i:S\\',
                        altInput: true,
                      }}
                      value={this.props.timespanAbsoluteTimestampUpperBound}
                      onChange={this.updateAbsoluteUpperBound}
                      name="value"
                    />
                  </Col>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
              <Tab eventKey="relative" title="Relativ">
                <br />
                <Container>
                  <Form.Row>
                    <Col>
                      <Form.Control
                        as="select"
                        name="timespanTypeUpperBound"
                        value={this.state.timespanTypeUpperBound}
                        onChange={this.handleLocalChangeUpperBound}
                      >
                        <option value="last">Letzte</option>
                        <option value="next">Nächste</option>
                      </Form.Control>
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        name="timespanAmountUpperBound"
                        min="1"
                        max="9999"
                        value={this.props.timespanAmountUpperBound}
                        onChange={this.handleChangeUpperBound}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        as="select"
                        name="timespanTimeUnitUpperBound"
                        value={this.props.timespanTimeUnitUpperBound}
                        onChange={this.handleChangeUpperBound}
                      >
                        <option value="seconds">Sekunden</option>
                        <option value="minutes">Minuten</option>
                        <option value="hours">Stunden</option>
                        <option value="days">Tage</option>
                      </Form.Control>
                    </Col>
                  </Form.Row>
                  <Dropdown.Divider />
                  <Row>
                    <Col>Aktualisieren alle</Col>
                  </Row>
                  <br />
                  <Row>
                    <SelectRefreshInterval
                      automaticRefresh={this.props.automaticRefresh}
                      handleRefreshChange={this.handleRefreshChange}
                      refreshInterval={this.props.refreshInterval}
                      refreshTimeUnit={this.props.refreshTimeUnit}
                    />
                  </Row>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
              <Tab eventKey="now" title="Jetzt">
                <Container>
                  <br />
                  <Row>
                    <Col className="text-center">Datum und Uhrzeit werden bei jeder Aktualisierung auf den aktuellen Zeitpunkt gesetzt</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className="text-center">
                      <Button onClick={this.updateNowUpperBound}>Datum und Uhrzeit auf aktuellen Zeitpunkt setzen</Button>
                    </Col>
                  </Row>
                  <Dropdown.Divider />
                  <Row>
                    <Col>Aktualisieren alle</Col>
                  </Row>
                  <br />
                  <Row>
                    <SelectRefreshInterval
                      automaticRefresh={this.props.automaticRefresh}
                      handleRefreshChange={this.handleRefreshChange}
                      refreshInterval={this.props.refreshInterval}
                      refreshTimeUnit={this.props.refreshTimeUnit}
                    />
                  </Row>
                  {this.state.dataNotAvailableError && <TimespanOrPointInTimeNotAvailable />}
                </Container>
              </Tab>
            </Tabs>
          </Dropdown.Menu>
        </Dropdown>
      </React.Fragment>
    );
  }

  handleRefreshChange = e => {
    const stateElement = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    this.props.accessTopbar(stateElement, value);
  };

  handleChangeLowerBound = e => {
    const stateElement = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    const newTimespanData = {
      [stateElement]: value,
      timeSelectionMode: 'timespan',
      timespanTypeLowerBound: this.state.timespanTypeLowerBound,
      sliderMode: 'timespan',
    };
    this.props.updateTimespanData(newTimespanData);
  };

  handleLocalChangeLowerBound = e => {
    const stateElement = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    this.setState<never>({ [stateElement]: value }, () => {
      const newTimespanData = {
        timeSelectionMode: 'timespan',
        timespanTypeLowerBound: this.state.timespanTypeLowerBound,
        sliderMode: 'timespan',
      };
      this.props.updateTimespanData(newTimespanData);
    });
  };

  updateAbsoluteLowerBound = e => {
    if (e[0]) {
      const newTimespanData = {
        timespanAbsoluteTimestampLowerBound: e[0].toISOString().split('.')[0] + 'Z',
        timeSelectionMode: 'timespan',
        timespanTypeLowerBound: 'absolute',
        sliderMode: 'timespan',
      };
      this.props.updateTimespanData(newTimespanData);
    }
  };

  updateNowLowerBound = () => {
    const newTimespanData = {
      timeSelectionMode: 'timespan',
      timespanTypeLowerBound: 'now',
      sliderMode: 'timespan',
    };
    this.props.updateTimespanData(newTimespanData);
  };

  handleChangeUpperBound = e => {
    const stateElement = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    const newTimespanData = {
      [stateElement]: value,
      timeSelectionMode: 'timespan',
      timespanTypeUpperBound: this.state.timespanTypeUpperBound,
      sliderMode: 'timespan',
    };
    this.props.updateTimespanData(newTimespanData);
  };

  handleLocalChangeUpperBound = e => {
    const stateElement = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    this.setState<never>({ [stateElement]: value }, () => {
      const newTimespanData = {
        timeSelectionMode: 'timespan',
        timespanTypeUpperBound: this.state.timespanTypeUpperBound,
        sliderMode: 'timespan',
      };
      this.props.updateTimespanData(newTimespanData);
    });
  };

  updateAbsoluteUpperBound = e => {
    if (e[0]) {
      const newTimespanData = {
        timespanAbsoluteTimestampUpperBound: e[0].toISOString().split('.')[0] + 'Z',
        timeSelectionMode: 'timespan',
        timespanTypeUpperBound: 'absolute',
        sliderMode: 'timespan',
      };
      this.props.updateTimespanData(newTimespanData);
    }
  };

  updateNowUpperBound = () => {
    const newTimespanData = {
      timeSelectionMode: 'timespan',
      timespanTypeUpperBound: 'now',
      sliderMode: 'timespan',
    };
    this.props.updateTimespanData(newTimespanData);
  };
}
