import React, { Component } from 'react'
import { Form, Nav } from 'react-bootstrap';

interface SolrCoreSelectorProps {
  baseUrl: string
}

interface SolrCoreSelectorState {
  items: string[]
}

export default class SolrCoreSelector extends Component<SolrCoreSelectorProps, SolrCoreSelectorState> {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
    }
  }

  render() {
    return (
      <Form.Group>
        <Form.Label>Core auswählen</Form.Label>
        <Form.Control as="select">
          {this.state.items}
        </Form.Control>
      </Form.Group>
    )
  }

  componentDidMount() {
    const url = this.props.baseUrl + "/admin/cores?action=STATUS&indexInfo=false&wt=json"
    console.log(url)
    fetch(url)
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

  componentDidUpdate() {
    this.setState({items: []})
    const url = this.props.baseUrl + "/admin/cores?action=STATUS&indexInfo=false&wt=json"
    console.log(url)
    fetch(url)
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