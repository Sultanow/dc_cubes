import React, { Component } from 'react';
import { Accordion, Card, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';

export class SectionRight extends Component {
  render() {
    return (
      <div className="section-right col-md-4">
        <div className="section-right-content-container" style={{ width: '100%' }}>
          <Accordion defaultActiveKey="0" style={{ width: '100%' }} id="section-right-accordion">
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
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        <span>Prozent</span>
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Zeitpunkt</span>
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Art des Vorfalls</span>
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                      <th>
                        <span>Ort des Vorfalls</span>
                        <Button className="btn-sort">
                          <FontAwesomeIcon icon={faSort} className="ml-1"></FontAwesomeIcon>
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>80%</td>
                      <td>Datum + Uhrzeit</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header>
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
            <Accordion.Collapse eventKey="1">
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
                    <tr>
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
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header>
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
                        <Button className="btn-sort">
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
                    <tr>
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
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
          </Accordion>
        </div>
      </div>
    );
  }

  componentDidUpdate() {}
}

export default SectionRight;
