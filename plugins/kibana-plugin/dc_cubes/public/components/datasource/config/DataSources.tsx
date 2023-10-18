import React from 'react';
import { Route, Link } from "react-router-dom";
import SolrSettings from './solr/SolrSettings'
import CsvSettings from './csv/CsvSettings'
import PrometheusSettings from './prometheus/PrometheusSettings'
import ElasticsearchSettings from './elasticsearch/ElasticsearchSettings'
import { Row, Col, Form, Button } from 'react-bootstrap';
import DataSource from '../../../model/DataSource'

interface DataSourcesProps {
    dataSource: DataSource
    dataSourceError: boolean
    dataSourceUrl: string
    solrBaseUrl: string
    solrCore: string
    solrQuery: string
    setDataSourceUrl: any
    setDataSource: any
    setSolrUrlPart: any
    history: any
    customMapping: any
    accessChild: any
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
                            
                            <Route path="/data-sources/csv" render={(props) => <CsvSettings {...props}  />}/>
                            <Route path="/data-sources/solr" render={(props) => <SolrSettings {...props} 
                                setDataSourceUrl={this.props.setDataSourceUrl}
                                dataSourceError={this.props.dataSourceError}
                                setSolrUrlPart={this.props.setSolrUrlPart}
                                dataSourceUrl={this.props.dataSourceUrl}
                                solrBaseUrl={this.props.solrBaseUrl}
                                solrCore={this.props.solrCore}
                                solrQuery={this.props.solrQuery}
                                customMapping={this.props.customMapping}
                                accessChild={this.props.accessChild} />}/>
                            <Route path="/data-sources/prometheus" render={(props) => <PrometheusSettings {...props}  />}/>
                            <Route path="/data-sources/elasticsearch" render={(props) => <ElasticsearchSettings {...props}  />}/>
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