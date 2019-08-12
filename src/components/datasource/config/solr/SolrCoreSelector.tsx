import React, { Component } from 'react'
import { Form } from 'react-bootstrap';

export default class SolrCoreSelector extends Component {

  items = [];

  constructor(props) {
    super(props);

    fetch('http://localhost:8983/solr/admin/cores?action=STATUS&indexInfo=false&wt=json')
        .then(res => res.json())
        .then((data) => {
          let strCores : string[] = Object.keys(data.status || {})

          strCores.forEach((strCore) => {
            this.items.push(<option>{strCore}</option>);
          });
        })
        .catch(console.log);
  }

  render() {
    return (
      <Form.Group>
        <Form.Label>Select core</Form.Label>
        <Form.Control as="select">
          {this.items}
        </Form.Control>
      </Form.Group>
    )
  }
} 