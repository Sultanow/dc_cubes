import React from 'react';
import { Route, Link } from "react-router-dom";
import SolrSettings from './solr/SolrSettings'
import CSVSettings from './csv/CSVSettings'
import PrometheusSettings from './prometheus/PrometheusSettings'
import ElasticsearchSettings from './elasticsearch/ElasticsearchSettings'
import { Row, Col, Form, Button } from 'react-bootstrap';
import DataSource from '../../../model/DataSource'

interface DataSourcesProps {
    elasticsearchIndex: string

    dataSource: DataSource
    dataSourceError: boolean
    solrBaseUrl: string
    solrCore: string
    solrQuery: string
    setDataSource: any
    setSolrUrlPart: any
    history: any
    customMapping: any
    accessApp: any
}

interface DataSourcesState {
    changeDataSource: boolean
}

class DataSources extends React.Component<DataSourcesProps, DataSourcesState> {

    constructor(props: DataSourcesProps) {
        super(props);
        this.state = {
         changeDataSource: false
        };
      }

    dataSources = ["csv", "solr", "prometheus", "elasticsearch"]

    render() {
        return (
            <div className="content-row">
                <br/>
                        <Col lg={4} className="content-container" style={{display: "block"}}>
                        <h2>Datenquelle</h2>
                            <br/>
                            <fieldset>
                                <Form.Group as={Row} onChange={this.props.setDataSource}>
                                <Col>
                                {
                                    this.state.changeDataSource ?
                                    this.dataSources.map((dataSource, index) => (
                                        <div key={index}>
                                            <Form.Check
                                            inline
                                            type="radio"
                                            label={dataSource}
                                            name="dataSourceRadio"
                                            id="dataSourceRadio"
                                            value={dataSource}
                                            defaultChecked={this.props.dataSource === dataSource}
                                            />
                                            <Link to={`/data-sources/${dataSource}`}>Einstellungen</Link>
                                        </div>
                                    ))
                                    :
                                    this.dataSources.map((dataSource, index) => (
                                        <div key={index}>
                                            <Form.Check
                                            inline
                                            type="radio"
                                            label={dataSource}
                                            name="dataSourceRadio"
                                            id="dataSourceRadio"
                                            value={dataSource}
                                            defaultChecked={this.props.dataSource === dataSource}
                                            disabled={this.props.dataSource !== dataSource}
                                            />
                                            <Link to={`/data-sources/${dataSource}`}>Einstellungen</Link>
                                        </div>
                                    ))
                                }
                                </Col>
                                </Form.Group>
                                <Button onClick={this.changeDataSource}>{this.state.changeDataSource ? "Speichern" : "Ändern" }</Button>
                            </fieldset>
                        </Col>
                        <Col lg={8} className="content-container" style={{display: "block"}}>
                            
                            <Route path="/data-sources/csv" render={(props) => <CSVSettings {...props}  />}/>
                            <Route path="/data-sources/solr" render={(props) => <SolrSettings {...props} 
                                dataSourceError={this.props.dataSourceError}
                                setSolrUrlPart={this.props.setSolrUrlPart}
                                solrBaseUrl={this.props.solrBaseUrl}
                                solrCore={this.props.solrCore}
                                solrQuery={this.props.solrQuery}
                                customMapping={this.props.customMapping}
                                accessApp={this.props.accessApp} />}/>
                            <Route path="/data-sources/prometheus" render={(props) => <PrometheusSettings {...props}  />}/>
                            <Route path="/data-sources/elasticsearch" render={(props) => <ElasticsearchSettings {...props}  
                                elasticsearchIndex={this.props.elasticsearchIndex}
                                dataSourceError={this.props.dataSourceError}
                                setSolrUrlPart={this.props.setSolrUrlPart}
                                solrBaseUrl={this.props.solrBaseUrl}
                                solrQuery={this.props.solrQuery}
                                customMapping={this.props.customMapping}
                                accessApp={this.props.accessApp} />}/>
                        </Col>
            </div>
            
        ) 
    };

    changeDataSource = () => {
        this.setState(prevState => ({
            changeDataSource: !prevState.changeDataSource
        }));
        this.props.history.push('/data-sources/'.concat(this.props.dataSource))
    }
}

export default DataSources;