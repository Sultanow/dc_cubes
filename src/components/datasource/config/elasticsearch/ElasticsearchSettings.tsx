import React, { Component } from 'react'
import { Form, Tab, Tabs, Col, Row, Badge, Table } from 'react-bootstrap'
import httpClient from 'axios'

interface ElasticsearchSettingsProps {
  elasticsearchIndex: string
  dataSourceError: boolean
  setSolrUrlPart: any
  solrBaseUrl: string
  solrQuery: string
  customMapping: any
  accessApp: any
}

interface ElasticsearchSettingsState {
  elasticsearchIndex: string
  solrBaseUrl: string
  solrQuery: string
  solrInstanceStatus: boolean
  items: string[]
  previewData: any
}

export default class ElasticsearchSettings extends Component<ElasticsearchSettingsProps, ElasticsearchSettingsState> {

  constructor(props) {
    super(props);

    this.state = {
      elasticsearchIndex: "dc_cubes_historic",

      solrBaseUrl: 'http://localhost:8983/solr/',
      solrQuery: '/query?q=*:*&start=0&rows=30000',
      solrInstanceStatus: false, // false -> offline, true -> online
      items: [],
      previewData: null
    }
  }

  render() {
    return (
        <div>
            <h2>Elasticsearch Einstellungen</h2>
            <br/>
            <Tabs defaultActiveKey="home" transition={false} id="noanim-tab-example">
                <Tab eventKey="home" title="Einstellungen">
                    <Form>
                        <br/>
                        <Form.Group as={Row} controlId="inputSolrBaseUrl">
                          <Col sm="2">
                            URL Preview:
                          </Col>
                          <Col sm="10">
                            { 
                              <a href={this.props.solrBaseUrl + this.props.elasticsearchIndex + this.props.solrQuery}>
                                {this.props.solrBaseUrl + this.props.elasticsearchIndex + this.props.solrQuery}
                              </a>
                            }
                          </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="inputSolrBaseUrl">
                          <Form.Label column sm="2">
                            Base URL:
                          </Form.Label>
                          <Col sm="8">
                            <Form.Control  onChange={this.handleChange} name="solrBaseUrl" value={this.props.solrBaseUrl} />
                          </Col>
                          <Col sm="2">
                            {
                              this.props.dataSourceError ? <Badge variant="danger">Offline</Badge>
                              : <Badge variant="success">Online</Badge>
                            }
                          </Col>
                        </Form.Group>
                    
                        <Form.Group>
                            <Form.Label>Index auswählen:</Form.Label>
                            <Form.Control onChange={this.handleChange} name="solrCore" as="select" value={this.props.elasticsearchIndex}>
                              {this.state.items}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Query:</Form.Label>
                          <Form.Control onChange={this.handleChange} as="textarea" rows="2" name="solrQuery" value={this.props.solrQuery} />
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Datenstruktur Mapping:</Form.Label>
                          <Form.Control onChange={this.handleChange} as="textarea" rows="12" name="mappingField" value={this.props.customMapping.toString()} />
                        </Form.Group>
                  </Form>
                </Tab>
                <Tab eventKey="profile" title="Vorschau">
                  <br/>
                  <Table striped bordered hover responsive size="sm" className="previewTable">
                    <thead>
                      <tr>{
                        this.state.previewData && Object.keys(this.state.previewData[0]).map((element, index) => {
                          return <th key={index}>{element}</th>    
                        })
                      }
                      </tr>
                    </thead>
                    <tbody>{
                      this.state.previewData && this.state.previewData.map((element, index) => {
                        return (<tr key={index}>{ Object.values(element).map((elementAttribute, id) => {
                        return (<td key={id}>{elementAttribute}</td>)
                        })}</tr>)
                      })
                    }
                    </tbody>
                  </Table>
                </Tab>
            </Tabs>
        </div>
    )
  }

  componentDidMount() {
    const url = this.state.solrBaseUrl.concat("admin/cores?action=STATUS&indexInfo=false&wt=json")
    this.getAllSolrCores(url)
    this.getPreviewData(this.state.solrBaseUrl, this.state.elasticsearchIndex, this.state.solrQuery)
  }

  handleChange = (e: any) => {
    const target = e.target;
    const value: any = target.value;
    const name: any = target.name;

    if (name === "solrBaseUrl") {
      this.setState({
        solrBaseUrl: value,
        items: [],
        solrInstanceStatus: false
      })

      const solrCoresUrl = value.concat("admin/cores?action=STATUS&indexInfo=false&wt=json")
      this.getAllSolrCores(solrCoresUrl)
      this.props.setSolrUrlPart("solrBaseUrl", value)
    }

    if (name === "solrQuery") {
      this.setState({
        solrQuery: value
      })
      this.props.setSolrUrlPart("solrQuery", value)
    }

    if (name === "solrCore") {
      this.setState({
        elasticsearchIndex: value
      })
      this.props.setSolrUrlPart("solrCore", value)
    }

    if (name === "mappingField") {
      this.props.accessApp("customMapping", eval(value))
    }

    this.getPreviewData(this.state.solrBaseUrl, this.state.elasticsearchIndex, this.state.solrQuery)
  };

  getAllSolrCores = (url: string) => {
    httpClient.get(url)
    .then((data) => {
        const dataItems: any = [];
        let strCores : string[] = Object.keys(data.data.status || {})

        strCores.forEach((strCore, index) => {
            dataItems.push(<option key={index} value={strCore}>{strCore}</option>);
        });

        this.setState({items: dataItems})
        this.props.accessApp('dataSourceError', false)
    })
    .catch((error) => {
      this.props.accessApp('dataSourceError', true)
      console.log(error)
    }); 
  }

  getPreviewData = (solrBaseUrl: string, solrCore: string, solrQuery: string) => {
    const url = solrBaseUrl + solrCore + solrQuery

    httpClient.get(url)
    .then((data) => {
        const previewData = data.data.response.docs || null
        this.setState({previewData: previewData.length >= 1 ? previewData.slice(0, 5) : null})
        this.props.accessApp('dataSourceError', false)
    })
    .catch((error) => {
        console.log(error)
    });
  }
}  