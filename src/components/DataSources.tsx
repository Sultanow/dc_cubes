import React from 'react';

interface DataSourcesProps {
    dataSource: string;
}

class DataSources extends React.Component<DataSourcesProps> {

    render() {
        return (<div id="data-sources">Data Sources Overview</div>)
    };
}

export default DataSources;