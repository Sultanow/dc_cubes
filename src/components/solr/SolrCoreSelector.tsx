import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap';

export default class SolrCoreSelector extends Component {
  
  items = [];
  
  constructor(props) {
    super(props);

    fetch('http://localhost:8983/solr/admin/cores?action=STATUS&indexInfo=false&wt=json')
        .then(res => res.json())
        .then((data) => {
          let strCores : string[] = Object.keys(data.status || {})

          strCores.forEach((strCore) => {
            this.items.push(<Dropdown.Item href="#/action-1">{strCore}</Dropdown.Item>);
          });
        })
        .catch(console.log);
  }

  render() {
    return (
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Select Core
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {this.items}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}