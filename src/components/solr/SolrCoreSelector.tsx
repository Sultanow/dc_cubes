import React, { Component } from 'react'
import { Form, Nav } from 'react-bootstrap';

interface SolrCoreSelectorState {
  items: string[]
}

export default class SolrCoreSelector extends Component<{}, SolrCoreSelectorState> {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
    }
  }

  render() {
    return (
      <div>
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link>Einstellungen</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link>Vorschau</Nav.Link>
          </Nav.Item>
        </Nav>
        <Form.Group>
          <Form.Label>Core auswählen</Form.Label>
          <Form.Control as="select">
            {this.state.items}
          </Form.Control>
        </Form.Group>
      </div>
    )
  }

  componentDidMount() {
    fetch('http://localhost:8983/solr/admin/cores?action=STATUS&indexInfo=false&wt=json')
        .then(res => res.json())
        .then((data) => {
          const dataItems = [];
          console.log(1)
          let strCores : string[] = Object.keys(data.status || {})

          strCores.forEach((strCore) => {
            dataItems.push(<option>{strCore}</option>);
          });
          this.setState({items: dataItems})
        })
        .catch(console.log);
  }
} 