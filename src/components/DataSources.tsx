import React from 'react';
import SolrDataService from '../util/SolrDataService';

interface DataSourcesProps {
    dataSource: string;
    selectedSolrCore: string;
}

class DataSources extends React.Component<DataSourcesProps> {

    componentDidMount() {
        const solrDataService = new SolrDataService();
        solrDataService.getAllSolrCores().then((data: any) => {
            console.log(data.data.status);
        }).catch((error: any) => console.log(error));
    };

    render() {
        return (<div id="data-sources">Data Sources Overview</div>)
    };
}

export default DataSources;