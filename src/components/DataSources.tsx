import React from 'react';
import { Route, Link } from "react-router-dom";
import SolrCoreSelector from '../components/solr/SolrCoreSelector'
import { Row, Col, Form  } from 'react-bootstrap';

interface DataSourcesProps {
    dataSource: string
}

interface DataSourcesState {
    baseUrl: string

}

class DataSources extends React.Component<DataSourcesProps, DataSourcesState> {

    constructor(props: DataSourcesProps) {
        super(props);
        this.state = {
         baseUrl: "",
        };
      }

    render() {
        return (
            <div className="main-canvas">
                <h2>Datenquelle ändern</h2>
                    <Row>
                        <Col>
                            <fieldset>
                                <Form.Group as={Row}>
                                <Col>
                                    <Form.Check
                                    type="radio"
                                    label="CSV"
                                    name="csv"
                                    id="csv"
                                    />
                                    <Form.Check
                                    type="radio"
                                    label={<Link to="/data-sources/solr">Solr</Link>}
                                    name="solr"
                                    id="solr"
                                    />
                                    <Form.Check
                                    type="radio"
                                    label="Prometheus"
                                    name="prometheus"
                                    id="prometheus"
                                    />
                                </Col>
                                </Form.Group>
                            </fieldset>
                        </Col>
                        <Col>
                            <Route path="/data-sources/solr" render={(props) => <SolrCoreSelector {...props}  />}/>
                        </Col>
                    </Row>
            </div>
            
        )
    };
}

export default DataSources;