import React, { Component } from "react";
import { Accordion, Card, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faCogs, faSort } from '@fortawesome/free-solid-svg-icons'

interface SectionRightState {

  dataSystem: Systemstatus[];
  dataRatios: Ratio[];
  dataParameters: Parameter[];
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
    }]


    super(props);
    this.state = {
      dataSystem: mockSystem,
      dataRatios: [],
      dataParameters: []
    }

  }

  sortColumn(event, sortKey) {

    console.log(event);
    debugger;
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
                {/* <div>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px"}} />
                  </Button>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                  </Button>
                </div> */}
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0" >
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        <span>Prozent</span>
                        <Button className="btn-sort" onClick={e => this.sortColumn(e, "percent")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Zeitpunkt</span>
                        <Button className="btn-sort" onClick={e => this.sortColumn(e, "timestamp")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Art des Vorfalls</span>
                        <Button className="btn-sort" onClick={e => this.sortColumn(e, "incidentType")}>
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Ort des Vorfalls</span>
                        <Button className="btn-sort" onClick={e => this.sortColumn(e, "incidentType")}>
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
                    {/* <tr>
                      <td>80%</td>
                      <td>01.01.2018 09:50</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr>
                    <tr>
                      <td>70%</td>
                      <td>01.01.2019 09:50</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr>
                    <tr>
                      <td>40%</td>
                      <td>01.11.2019 09:50</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr>
                    <tr>
                      <td>60%</td>
                      <td>15.11.2019 09:50</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr> */}
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="1" as={Card.Header} className="accordion-btn ripple">
                <div>Kennzahlen</div>
                {/* <div>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px"}} />
                  </Button>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                  </Button>
                </div> */}
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1" >
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        Titel
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        In Ansicht
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Ohne Filter
                        <Button className="btn-sort">
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
                    {/* <tr>
                      <td>Min</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Max</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Avg</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Summe</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Anzahl</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Range</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Data</td>
                      <td></td>
                      <td></td>
                    </tr> */}
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="2" as={Card.Header} className="accordion-btn ripple">
                <div>Parameter-Übersicht</div>
                {/* <div>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px"}} />
                  </Button>
                  <Button className="btn-util-light">
                    <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                  </Button>
                </div> */}
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        Parameter
                        <Button className="btn-sort" >
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Min
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Max
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        Avg
                        <Button className="btn-sort">
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
                    {/* <tr>
                      <td>CPU-Auslastung</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Speicherzugriffe/sek.</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Arbeitsspeicher-Ausl.</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Anzahl Threads</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Anzahl Prozesse</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Antwortzeit</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr> */}
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
