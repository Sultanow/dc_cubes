import React, { Component } from "react";
import { Accordion, Card, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faCogs, faSort } from '@fortawesome/free-solid-svg-icons'



interface SectionRightState {

  dataSystem: Systemstatus[];
  dataRatios: Ratio[];
  dataParameters: Parameter[];

  SystemIsColumnAscending: {
    percent: boolean,
    timestamp: boolean,
    incidentPlace: boolean,
    incidentType: boolean
  };
  RatiosIsColumnAscending: {
    title: boolean,
    inView: boolean,
    withoutFilter: boolean,
  };
  ParamsIsColumnAscending: {
    param: boolean,
    min: boolean,
    max: boolean,
    avg: boolean
  };
}
interface Systemstatus {
  percent: number;
  timestamp: Date;
  incidentType: string;
  incidentPlace: string;
}

interface Ratio {
  title: string;
  inView: string;
  withoutFilter: string;
}

interface Parameter {
  parameter: string;
  min: number;
  max: number;
  avg: number;
}

export class SectionRight extends React.Component<{}, SectionRightState> {

  constructor(props: object) {

    let mockSystem: Systemstatus[] = [{
      percent: 80,
      timestamp: new Date("2019-10-10 15:10"),
      incidentPlace: "Server 1",
      incidentType: "Überlastung"
    },
    {
      percent: 90,
      timestamp: new Date("2019-10-11 15:10"),
      incidentPlace: "Server 1",
      incidentType: "Überlastung"
    },
    {
      percent: 87,
      timestamp: new Date("2019-10-12 15:10"),
      incidentPlace: "Server 1",
      incidentType: "Überlastung"
    }];
    let mockRatios: Ratio[] = [{
      title: "CPU",
      inView: "",
      withoutFilter: "",
    },
    {
      title: "Datenbank",
      inView: "",
      withoutFilter: "",
    },
    {
      title: "RAM",
      inView: "",
      withoutFilter: "",
    }];

    let mockParams: Parameter[] = [{
      parameter: "CPU",
      min: 0,
      max: 100,
      avg: 50,
    },
    {
      parameter: "Zugriffe",
      min: 201,
      max: 545,
      avg: 323,
    },
    {
      parameter: "RAM",
      min: 20,
      max: 110,
      avg: 65,
    }];


    super(props);
    this.state = {
      dataSystem: mockSystem,
      dataRatios: mockRatios,
      dataParameters: mockParams,
      SystemIsColumnAscending: {
        timestamp: null,
        incidentPlace: null,
        incidentType: null,
        percent: null
      },
      ParamsIsColumnAscending: {
        avg: null,
        min: null,
        max: null,
        param: null
      },
      RatiosIsColumnAscending: {
        inView: null,
        title: null,
        withoutFilter: null
      }

    }

  }

  sortSystemstatus(event, sortKey) {
    if (this.state.SystemIsColumnAscending[sortKey] == null) {
      this.state.SystemIsColumnAscending[sortKey] = true;
    }

    const sortedData = this.state.dataSystem;
    // sort in ascending order
    sortedData.sort((a, b) => {
      let val1 = a[sortKey];
      let val2 = b[sortKey];

      if (typeof (val1) == "string") {
        val1 = val1.toUpperCase(); // ignore upper and lowercase
        val2 = val2.toUpperCase(); // ignore upper and lowercase
      }
      if (val1 < val2) {
        return -1;
      }
      if (val1 > val2) {
        return 1;
      }
      //equal
      return 0;
    });

    // Reverse order if it should be descending
    if (!this.state.SystemIsColumnAscending[sortKey]) {
      sortedData.reverse();
    }
    // update asc|desc state
    this.state.SystemIsColumnAscending[sortKey] = !this.state.SystemIsColumnAscending[sortKey];
    this.setState({ dataSystem: sortedData })
  }
  sortRatios(event, sortKey) {
    if (this.state.RatiosIsColumnAscending[sortKey] == null) {
      this.state.RatiosIsColumnAscending[sortKey] = true;
    }

    const sortedData = this.state.dataRatios;
    // sort in ascending order
    sortedData.sort((a, b) => {
      let val1 = a[sortKey];
      let val2 = b[sortKey];

      if (typeof (val1) == "string") {
        val1 = val1.toUpperCase(); // ignore upper and lowercase
        val2 = val2.toUpperCase(); // ignore upper and lowercase
      }
      if (val1 < val2) {
        return -1;
      }
      if (val1 > val2) {
        return 1;
      }
      //equal
      return 0;
    });

    // Reverse order if it should be descending
    if (!this.state.RatiosIsColumnAscending[sortKey]) {
      sortedData.reverse();
    }
    // update asc|desc state
    this.state.RatiosIsColumnAscending[sortKey] = !this.state.RatiosIsColumnAscending[sortKey];
    this.setState({ dataRatios: sortedData })
  }

  sortParams(event, sortKey) {
    if (this.state.ParamsIsColumnAscending[sortKey] == null) {
      this.state.ParamsIsColumnAscending[sortKey] = true;
    }

    const sortedData = this.state.dataParameters;
    // sort in ascending order
    sortedData.sort((a, b) => {
      let val1 = a[sortKey];
      let val2 = b[sortKey];

      if (typeof (val1) == "string") {
        val1 = val1.toUpperCase(); // ignore upper and lowercase
        val2 = val2.toUpperCase(); // ignore upper and lowercase
      }
      if (val1 < val2) {
        return -1;
      }
      if (val1 > val2) {
        return 1;
      }
      //equal
      return 0;
    });

    // Reverse order if it should be descending
    if (!this.state.ParamsIsColumnAscending[sortKey]) {
      sortedData.reverse();
    }
    // update asc|desc state
    this.state.ParamsIsColumnAscending[sortKey] = !this.state.ParamsIsColumnAscending[sortKey];
    this.setState({ dataParameters: sortedData })
  }

  render() {
    let dataSystem: Systemstatus[] = this.state.dataSystem;
    let dataRatios: Ratio[] = this.state.dataRatios;
    let dataParams: Parameter[] = this.state.dataParameters;
    return (
      <div className="section-right col-md-3">
        <div
          className="section-right-content-container"
          style={{ width: "100%" }}
        >
          <Accordion
            defaultActiveKey="0"
            style={{ width: "100%" }}
            id="section-right-accordion"
          >
            <Card.Header>
              <Accordion.Toggle eventKey="0" as={Card.Header} className="accordion-btn">
                <div>Systemstatus</div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0" >
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        <span>Prozent</span>
                        <Button className="btn-sort" onClick={e => this.sortSystemstatus(e, "percent")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Zeitpunkt</span>
                        <Button className="btn-sort" onClick={e => this.sortSystemstatus(e, "timestamp")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Art des Vorfalls</span>
                        <Button className="btn-sort" onClick={e => this.sortSystemstatus(e, "incidentType")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Ort des Vorfalls</span>
                        <Button className="btn-sort" onClick={e => this.sortSystemstatus(e, "incidentPlace")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSystem.map(function (element: Systemstatus, index) {
                      return (
                        <tr key={index} data-item={element}>
                          <td data-title="">{element.percent}</td>
                          <td data-title="">{element.timestamp.toDateString()}</td>
                          <td data-title="">{element.incidentType}</td>
                          <td data-title="">{element.incidentPlace}</td>
                        </tr>
                      )
                    })}

                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="1" as={Card.Header} className="accordion-btn ripple">
                <div>Kennzahlen</div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1" >
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        Titel
                        <Button className="btn-sort" onClick={e => this.sortRatios(e, "titel")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        In Ansicht
                        <Button className="btn-sort" onClick={e => this.sortRatios(e, "inView")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Ohne Filter
                        <Button className="btn-sort" onClick={e => this.sortRatios(e, "withoutFilter")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {dataRatios.map(function (element: Ratio, index) {
                      return (
                        <tr key={index} data-item={element}>
                          <td data-title="">{element.title}</td>
                          <td data-title="">{element.inView}</td>
                          <td data-title="">{element.withoutFilter}</td>
                        </tr>
                      )
                    })}

                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="2" as={Card.Header} className="accordion-btn ripple">
                <div>Parameter-Übersicht</div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        Parameter
                        <Button className="btn-sort" onClick={e => this.sortParams(e, "parameter")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Min
                        <Button className="btn-sort" onClick={e => this.sortParams(e, "min")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Max
                        <Button className="btn-sort" onClick={e => this.sortParams(e, "max")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Avg
                        <Button className="btn-sort" onClick={e => this.sortParams(e, "avg")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {dataParams.map(function (element: Parameter, index) {
                      return (
                        <tr key={index} data-item={element}>
                          <td data-title="">{element.parameter}</td>
                          <td data-title="">{element.min}</td>
                          <td data-title="">{element.max}</td>
                          <td data-title="">{element.avg}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
          </Accordion>
        </div>
      </div>
    );
  }

  componentDidUpdate() {

  }
}

export default SectionRight;
