import React, { Component } from 'react'
import { Form, Tab, Tabs, Col, Row, Badge, Table } from 'react-bootstrap'
import httpClient from 'axios'

interface EsSettingsProps {
  dataSourceError: boolean
  setEsUrlPart: any
  esBaseUrl: string
  esIndex: string
  esQuery: string
  customMapping: any
  accessApp: any
}

interface EsSettingsState {
  esIndex: string
  esBaseUrl: string
  esQuery: string
  esInstanceStatus: boolean
  items: string[]
  previewData: any
}

export default class EsSettings extends Component<EsSettingsProps, EsSettingsState> {

  constructor(props) {
    super(props);

    this.state = {
      esBaseUrl: 'http://localhost:9200',
      esIndex: 'dc_cubes', 
      esQuery: '/_search?pretty=true&q=*:*&size=10000',
      esInstanceStatus: false, // false -> offline, true -> online
      items: [],
      previewData: []
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
                        <Form.Group as={Row} controlId="inputEsBaseUrl">
                          <Col sm="2">
                            URL Preview:
                          </Col>
                          <Col sm="10">
                            { 
                              <a href={this.props.esBaseUrl + this.props.esIndex + this.props.esQuery}>
                                {this.props.esBaseUrl + this.props.esIndex + this.props.esQuery}
                              </a>
                            }
                          </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="inputEsBaseUrl">
                          <Form.Label column sm="2">
                            Base URL:
                          </Form.Label>
                          <Col sm="8">
                            <Form.Control  onChange={this.handleChange} name="esBaseUrl" value={this.props.esBaseUrl} />
                          </Col>
                          <Col sm="2">
                            {
                              this.props.dataSourceError ? <Badge variant="danger">Offline</Badge>
                              : <Badge variant="success">Online</Badge>
                            }
                          </Col>
                        </Form.Group>
                    
                        <Form.Group>
                            <Form.Label>Core auswählen:</Form.Label>
                            <Form.Control onChange={this.handleChange} name="esIndex" as="select" value={this.props.esIndex}>
                              {this.state.items}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Query:</Form.Label>
                          <Form.Control onChange={this.handleChange} as="textarea" rows="2" name="esQuery" value={this.props.esQuery} />
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
    const url = this.state.esBaseUrl.concat("admin/cores?action=STATUS&indexInfo=false&wt=json")
    this.getAllEsIndices(url)
    this.getPreviewData(this.state.esBaseUrl, this.state.esIndex, this.state.esQuery)
  }

  handleChange = (e: any) => {
    const target = e.target;
    const value: any = target.value;
    const name: any = target.name;

    if (name === "esBaseUrl") {
      this.setState({
        esBaseUrl: value,
        items: [],
        esInstanceStatus: false
      })

      const esIndicesUrl = value.concat("admin/cores?action=STATUS&indexInfo=false&wt=json")
      this.getAllEsIndices(esIndicesUrl)
      this.props.setEsUrlPart("esBaseUrl", value)
    }

    if (name === "esQuery") {
      this.setState({
        esQuery: value
      })
      this.props.setEsUrlPart("esQuery", value)
    }

    if (name === "esIndex") {
      this.setState({
        esIndex: value
      })
      this.props.setEsUrlPart("esIndex", value)
    }

    if (name === "mappingField") {
      this.props.accessApp("customMapping", eval(value))
    }

    this.getPreviewData(this.state.esBaseUrl, this.state.esIndex, this.state.esQuery)
  };

  getAllEsIndices = (url: string) => {
    httpClient.get(url)
    .then((data) => {
        const dataItems: any = [];
        let strIndices : string[] = Object.keys(data.data.status || {})

        strIndices.forEach((strIndex, index) => {
            dataItems.push(<option key={index} value={strIndex}>{strIndex}</option>);
        });

        this.setState({items: dataItems})
        this.props.accessApp('dataSourceError', false)
    })
    .catch((error) => {
      this.props.accessApp('dataSourceError', true)
      console.log(error)
    }); 
  }

  getPreviewData = (esBaseUrl: string, esIndex: string, esQuery: string) => {
    const url = esBaseUrl + esIndex + esQuery

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