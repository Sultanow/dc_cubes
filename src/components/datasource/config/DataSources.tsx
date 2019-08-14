import React from 'react';
import { Route, Link } from "react-router-dom";
import SolrSettings from './solr/SolrSettings'
import CsvSettings from './csv/CsvSettings'
import PrometheusSettings from './prometheus/PrometheusSettings'
import ElasticsearchSettings from './elasticsearch/ElasticsearchSettings'
import { Row, Col, Form, Button } from 'react-bootstrap';

interface DataSourcesProps {
    dataSource: string
    dataSourceUrl: string
    solrBaseUrl: string
    solrCore: string
    solrQuery: string
    setDataSourceUrl: any
    setDataSource: any
    setSolrUrlPart: any
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
            <div className="main-canvas">
                <br/>
                    <Row>
                        <Col lg={4}>
                        <h2>Datenquelle</h2>
                            <br/>
                            <fieldset>
                                <Form.Group as={Row} onChange={this.props.setDataSource}>
                                <Col>
                                {
                                    this.state.changeDataSource ?
                                    this.dataSources.map((dataSource, index) => (
                                        <Form.Check
                                            key={index}
                                            type="radio"
                                            label={<Link to={`/data-sources/${dataSource}`}>{dataSource}</Link>}
                                            name="dataSourceRadio"
                                            id="dataSourceRadio"
                                            value={dataSource}
                                            defaultChecked={this.props.dataSource === dataSource}
                                        />
                                    ))
                                    :
                                    this.dataSources.map((dataSource, index) => (
                                        <Form.Check
                                            key={index}
                                            type="radio"
                                            label={<Link to={`/data-sources/${dataSource}`}>{dataSource}</Link>}
                                            name="dataSourceRadio"
                                            id="dataSourceRadio"
                                            value={dataSource}
                                            defaultChecked={this.props.dataSource === dataSource}
                                            disabled={this.props.dataSource !== dataSource}
                                        />
                                    ))
                                }
                                </Col>
                                </Form.Group>
                                <Button onClick={this.changeDataSource}>{this.state.changeDataSource ? "Speichern" : "Ändern" }</Button>
                            </fieldset>
                        </Col>
                        <Col lg={8}>
                            
                            <Route path="/data-sources/csv" render={(props) => <CsvSettings {...props}  />}/>
                            <Route path="/data-sources/solr" render={(props) => <SolrSettings {...props} 
                                setDataSourceUrl={this.props.setDataSourceUrl}
                                setSolrUrlPart={this.props.setSolrUrlPart}
                                dataSourceUrl={this.props.dataSourceUrl}
                                solrBaseUrl={this.props.solrBaseUrl}
                                solrCore={this.props.solrCore}
                                solrQuery={this.props.solrQuery} />}/>
                            <Route path="/data-sources/prometheus" render={(props) => <PrometheusSettings {...props}  />}/>
                            <Route path="/data-sources/elasticsearch" render={(props) => <ElasticsearchSettings {...props}  />}/>
                        </Col>
                    </Row>
            </div>
            
        )
    };

    changeDataSource = () => {
        this.setState(prevState => ({
            changeDataSource: !prevState.changeDataSource
        }));
        /* const url = "/data-sources/" + this.state.baseUrl
        this.props.history.push(url) */
    }
}

export default DataSources;