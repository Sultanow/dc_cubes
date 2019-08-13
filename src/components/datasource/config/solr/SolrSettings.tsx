import React, { Component } from 'react'
import { Form, Tab, Tabs, Col, Row, Badge } from 'react-bootstrap';
import httpClient from 'axios';

interface SolrSettingsProps {
  baseUrl: string
  setBaseUrl: any
}

/* interface SolrSettingsState {
  selectedSolrCore: string
  solrBaseUrl: string
  solrQuery: string
  solrInstanceStatus: boolean
  items: string[]
} */

export default class SolrSettings extends Component<SolrSettingsProps, any> {

  constructor(props) {
    super(props);

    this.state = {
      /* solrBaseUrl: '',
      selectedSolrCore: '', */
      solrQuery: '',
      solrInstanceStatus: false,
      items: [],
    }
  }

  render() {
    return (
        <div>
            <h2>Solr Einstellungen</h2>
            <br/>
            <Tabs defaultActiveKey="home" transition={false} id="noanim-tab-example">
                <Tab eventKey="home" title="Einstellungen">
                    <Form>
                        <br/>
                        <Form.Group as={Row} controlId="inputSolrBaseUrl">
                          <Form.Label column sm="3">
                            Base Url
                          </Form.Label>
                          <Col sm="7">
                            <Form.Control  onChange={this.handleChange} name="solrBaseUrl" defaultValue={this.props.baseUrl} />
                          </Col>
                          <Col sm="2">
                            {
                              this.state.solrInstanceStatus ? <Badge variant="success">Online</Badge>
                              : <Badge variant="danger">Offline</Badge>
                            }
                          </Col>
                        </Form.Group>
                    </Form>
                    <Form.Group>
                        <Form.Label>Core auswählen</Form.Label>
                        <Form.Control name="selectedSolrCore" as="select">
                        {this.state.items}
                        </Form.Control>
                    </Form.Group>
                </Tab>
                <Tab eventKey="profile" title="Vorschau">
                </Tab>
            </Tabs>
        </div>
    )
  }

  componentDidMount() {
    const url = this.props.baseUrl.concat("/admin/cores?action=STATUS&indexInfo=false&wt=json")
    this.getAllSolrCores(url)
  }

  handleChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.props.setBaseUrl(value)

    this.setState({
      [name]: value,
      items: [],
      solrInstanceStatus: false
    });

    const solrCoresUrl = value.concat("/admin/cores?action=STATUS&indexInfo=false&wt=json")
    console.log(solrCoresUrl)
    this.getAllSolrCores(solrCoresUrl)
    /* const solrCore = document.getElementById("solrCore")
    console.log(document.getElementById("solrBaseUrl"))
    console.log(solrCore)
    this.props.setBaseUrl(e.target.value)
    this.setState({ 
      solrBaseUrl: e.target.value,
      items:[],
      solrInstanceStatus: false
    });
    const url = e.target.value.concat("/admin/cores?action=STATUS&indexInfo=false&wt=json")
       */
  };

  getAllSolrCores = (url: string) => {
    httpClient.get(url)
    .then((data) => {
        const dataItems = [];
        let strCores : string[] = Object.keys(data.data.status || {})

        strCores.forEach((strCore, index) => {
            dataItems.push(<option key={index} value={strCore}>{strCore}</option>);
        });

        this.setState({
          items: dataItems,
          solrInstanceStatus: true
        })
    })
    .catch(function (error) {
        console.log(error)
    }); 
  }
}  