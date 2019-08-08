import React, { Component } from 'react';
import { Navbar, Dropdown, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearchPlus, faClock } from '@fortawesome/free-solid-svg-icons'
import './Topbar.css'

export default class Topbar extends Component
{
    render()
    {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand>DC Cubes</Navbar.Brand>
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

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                                <Form.Control placeholder="Von" />
                                <Form.Control placeholder="Bis" />
                            </Dropdown>



                        </Row>

                    </div>

                </Form>





            </Navbar>
        )
    }
}
