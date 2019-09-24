import React, { Component } from "react";
import { Accordion, Card, Button } from "react-bootstrap";

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
                Systemstatus
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0" >
              <Card.Body>
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum L
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="1" as={Card.Header} className="accordion-btn ripple">
                Kennzahlen
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1" >
              <Card.Body>
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum L
              </Card.Body>
            </Accordion.Collapse>
            <Card.Header >
              <Accordion.Toggle eventKey="2" as={Card.Header} className="accordion-btn ripple">
                Parameterübersicht
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum
                Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum. Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum vLorem Ipsum Lorem Ipsum.
                Lorem Ipsum Lorem Ipsum L
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
