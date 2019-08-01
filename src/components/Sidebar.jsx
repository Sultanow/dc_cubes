import React, { Component } from 'react'
import { Button, Navbar, Dropdown, Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faBars, faCoins, faChartLine, faCogs, faFile } from '@fortawesome/free-solid-svg-icons'
import './Sidebar.css'

export default class Sidebar extends Component
{
    state = {
        active: true,
    }

    toggle = () =>
    {
        this.setState({
            active: !this.state.active
        })
    }
    render()
    {
        return (
            <div className={this.state.active ? 'sidebar active' : 'sidebar'}>
                <div className="sidebar-header" >
                    <Button variant="light" onClick={this.toggle}><FontAwesomeIcon icon={faBars} size="lg" /></Button>
                </div>
                <Button variant="light" size="lg"><FontAwesomeIcon icon={faChartBar} /></Button>
                <Button variant="light" size="lg"><FontAwesomeIcon icon={faChartLine} /></Button>
                <Button variant="light" size="lg"><FontAwesomeIcon icon={faFile} /></Button>
                <div className="sidebar-bottom">
                    <Button variant="light" size="lg"><FontAwesomeIcon icon={faCoins} /></Button>
                    <Button variant="light" size="lg"><FontAwesomeIcon icon={faCogs} /></Button>
                </div>

            </div>
        )
    }
}
