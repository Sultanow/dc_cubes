import React, { Component } from 'react'
import { NavLink } from "react-router-dom";
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faBars, faCoins, faChartLine, faCogs, faFile } from '@fortawesome/free-solid-svg-icons'
import './Sidebar.css'
import DataSource from '../model/DataSource'

interface SidebarProps {
    dataSource: DataSource
}

export default class Sidebar extends Component<SidebarProps,{}>
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
                <NavLink to="/" activeClassName="active"><Button variant="light" size="lg"><FontAwesomeIcon icon={faChartBar} /></Button></NavLink>
                <Button variant="light" size="lg"><FontAwesomeIcon icon={faChartLine} /></Button>
                <Button variant="light" size="lg"><FontAwesomeIcon icon={faFile} /></Button>
                <div className="sidebar-bottom">
                    <NavLink to={`/data-sources/${this.props.dataSource}`} activeClassName="active"><Button  variant="light" size="lg"><FontAwesomeIcon icon={faCoins} /></Button></NavLink>
                    <Button variant="light" size="lg"><FontAwesomeIcon icon={faCogs} /></Button>
                </div>

            </div>
        )
    }
}
