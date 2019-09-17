import React, { Component } from 'react'
import {Accordion, Card, Button} from "react-bootstrap"

export class SectionRight extends Component {
   render() {
      return (
         <div>
            <Accordion defaultActiveKey="0">
               <Card>
                  <Card.Header>
                     <Accordion.Toggle as={Button} variant="link" eventKey="0">
                     Systemstatus
                     </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                     <Card.Body>Lorem Ipsum</Card.Body>
                  </Accordion.Collapse>
               </Card>
               <Card>
                  <Card.Header>
                     <Accordion.Toggle as={Button} variant="link" eventKey="1">
                     Kennzahlen
                     </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="1">
                     <Card.Body>Lorem Ipsum</Card.Body>
                  </Accordion.Collapse>
               </Card>
               <Card>
                  <Card.Header>
                     <Accordion.Toggle as={Button} variant="link" eventKey="2">
                     Parameterübersicht
                     </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="2">
                     <Card.Body>Lorem Ipsum</Card.Body>
                  </Accordion.Collapse>
               </Card>
            </Accordion>
         </div>
      )
   }
}

export default SectionRight
