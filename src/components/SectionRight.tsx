import React, { Component } from "react";
import { Accordion, Card, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons'

export class SectionRight extends Component {
  render() {
    return (
      <div className="section-right col-md-4">
        <div
          className="section-right-content-container"
          style={{ height: "100%", width: "100%" }}
        >
          <Accordion
            defaultActiveKey="0"
            style={{ width: "100%" }}
            id="section-right-accordion"
          >
            <Card.Header >
              <Accordion.Toggle eventKey="0" as={Card.Header} className="accordion-btn ripple">
                <div>Systemstatus</div>
                <div>
                  <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                </div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0" >
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Prozent</th>
                      <th>Zeitpunkt</th>
                      <th>Art des Vorfalls</th>
                      <th>Ort des Vorfalls</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>80%</td>
                      <td>Datum + Uhrzeit</td>
                      <td>Leerlauf</td>
                      <td>Server 17, Cluster 9, RZ 2</td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="1" as={Card.Header} className="accordion-btn ripple">
                <div>Kennzahlen</div>
                <div>
                  <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                </div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1" >
              <Card.Body>
              <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Titel</th>
                      <th>In Ansicht</th>
                      <th>Ohne Filter</th>
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
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="2" as={Card.Header} className="accordion-btn ripple">
                <div>Parameter-Übersicht</div>
                <div>
                  <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                </div>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
              <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CPU-Auslastung</td>
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
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Ipsum</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Lorem</td>
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

  setupAccordion() {
    var accordionElement: HTMLElement = document.getElementById("section-right-accordion");

    /* always keep at least 1 open by preventing the current to close itself */


    // $('[data-toggle="collapse"]').on('click',function(e){
    // if ( $(this).parents('.accordion').find('.collapse.show') ){
    //     var idx = $(this).index('[data-toggle="collapse"]');
    //     if (idx == $('.collapse.show').index('.collapse')) {
    //         // prevent collapse
    //         e.stopPropagation();
    //     }
    // }
    // });  

  }

  componentDidUpdate() {
    this.setupAccordion();
  }
}

export default SectionRight;
