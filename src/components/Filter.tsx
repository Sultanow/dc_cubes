import React, { Component } from 'react'
import { Accordion, Card, Button, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faEyeSlash, faEye, faTrashAlt, faAdjust, faTimes } from '@fortawesome/free-solid-svg-icons'
import FilterTag from "../components/FilterTag"

export class Filter extends Component {
   render() {
      return (
         <div className="filter-container">
            <Accordion
               style={{ width: "100%" }}
               id="filter-accordion"
            >
               <Card.Header style={{ width: "100%" }}>
                  <Accordion.Toggle eventKey="0" as={Card.Header} className="">
                     <Button className="filter-accordion-btn d-flex">
                        <span>Filter</span>
                        <div id="filter-count">4</div>
                     </Button>
                     <div id="filter-input-container" style={{ width: "100%" }}>
                        <form>
                           <input
                           autoComplete="off"
                           type="search"
                           name="focus"
                           id="filter-input"
                           placeholder="Type here your filter"
                           />
                        </form>
                     </div>
                  </Accordion.Toggle>
               </Card.Header>
               <Accordion.Collapse eventKey="0" >
                  <Card.Body style={{ height: "100px", overflow: "hidden", padding: "10px", backgroundColor: "white", display: "flex", float: "left", width: "100%", marginBottom: "10px" }}>
                     <Dropdown>
                        <Dropdown.Toggle className="filter-settings-btn dropright" variant="light" id="dropdown-basic">
                           <FontAwesomeIcon icon={faCogs}/>
                        </Dropdown.Toggle>
                        <Dropdown.Menu x-placement="right-start" className="filter-settings-dropdown-menu">
                           <span className="filter-menu-dropdown-title">Alle Filter bearbeiten</span>
                           <Dropdown.Divider />
                           <Dropdown.Item href="#/action-1">
                              <FontAwesomeIcon icon={faEye}/>
                              &nbsp;Alle aktivieren
                           </Dropdown.Item>
                           <Dropdown.Item href="#/action-2">
                              <FontAwesomeIcon icon={faEyeSlash}/>
                              &nbsp;Alle deaktivieren
                           </Dropdown.Item>
                           <Dropdown.Item href="#/action-3">
                              <FontAwesomeIcon icon={faAdjust}/>
                              &nbsp;Bedingungen umkehren
                           </Dropdown.Item>
                           <Dropdown.Item href="#/action-2">
                              <FontAwesomeIcon icon={faEye}/>
                              &nbsp;Aktivierungen umkehren
                           </Dropdown.Item>
                           <Dropdown.Item href="#/action-3">
                              <FontAwesomeIcon icon={faTrashAlt}/>
                              &nbsp;Alle löschen
                           </Dropdown.Item>
                     </Dropdown.Menu>
                    </Dropdown>
                    <div className="filter-tags-container row justify-content-start">
                     <FilterTag/>
                     <FilterTag/>
                     <FilterTag/>
                     <FilterTag/>
                    </div>
                  </Card.Body>
               </Accordion.Collapse>
            </Accordion>
         </div>
      )
   }
}

export default Filter
