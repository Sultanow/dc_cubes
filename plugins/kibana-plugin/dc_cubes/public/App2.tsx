import React from 'react';
// import './App.css';
// import Sidebar from './components/Sidebar'
import CubesVisualization from '../plugin_test/src/components/visualization3d/CubesVisualization';
import TimeseriesNavigationChart from '../plugin_test/src/components/visualization2d/TimeseriesNavigationChart';
import SolrDataService from '../plugin_test/src/components/datasource/service/solr/SolrDataService';
import SolrAdapter from '../plugin_test/src/components/datasource/service/solr/SolrAdapter';
import DCState from '../plugin_test/src/model/DCState';

interface AppState {
  logData: [];
  dataSource: string;
  dataSourceUrl: string;
  solrBaseUrl: string;
  solrCore: any;
  solrQuery: string;
  dataSourceError: boolean;
  selectedPointInTime: number;
  selectedTimespan: [number, number];

  timeSelectionMode: 'pointInTime' | 'timespan';
  timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now';
  timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now';
  timespanAbsoluteTimestampLowerBound: string;
  timespanAbsoluteTimestampUpperBound: string;
  timespanTimeUnitLowerBound: 'seconds' | 'minutes' | 'hours' | 'days';
  timespanAmountLowerBound: number;
  timespanTimeUnitUpperBound: 'seconds' | 'minutes' | 'hours' | 'days';
  timespanAmountUpperBound: number;
  pointInTimeTimestamp: string;

  sliderMode: 'pointInTime' | 'timespan' | 'hidden';
  temporalAxis: string[];
  timeSeries: Map<string, DCState>;
  clusterColors: object;
  grid: Map<string, number[]>;
  maxH: number;

  isRawTimeseriesDataLoaded: boolean;
  intervalId: any;
  rawTimeseriesData: any;
  timespanError: boolean;
  isLoading: boolean;

  currentAvgValue: number;
  customMapping: any;
}

export default class App2 extends React.Component<{}, AppState> {
  constructor(props: object) {
    super(props);
    this.state = {
      logData: [],
      dataSource: 'solr',
      dataSourceUrl: 'http://localhost:8983/solr/dc_cubes/query?q=*:*&start=0&rows=30000',
      solrBaseUrl: 'http://localhost:8983/solr/',
      solrCore: 'dc_cubes',
      solrQuery: '/query?q=*:*&start=0&rows=30000',
      dataSourceError: true,
      selectedPointInTime: 0,
      selectedTimespan: [0, 0],
      timeSelectionMode: 'pointInTime',
      timespanTypeLowerBound: 'now',
      timespanTypeUpperBound: 'now',
      timespanAbsoluteTimestampLowerBound: new Date().toISOString().split('.')[0] + 'Z',
      timespanAbsoluteTimestampUpperBound: new Date().toISOString().split('.')[0] + 'Z',
      timespanTimeUnitLowerBound: 'minutes',
      timespanAmountLowerBound: 10,
      timespanTimeUnitUpperBound: 'minutes',
      timespanAmountUpperBound: 10,
      pointInTimeTimestamp: undefined,
      sliderMode: 'pointInTime',
      temporalAxis: [],
      timeSeries: new Map(),
      clusterColors: {},
      grid: new Map(),
      maxH: 0,
      rawTimeseriesData: null,
      isRawTimeseriesDataLoaded: false,
      intervalId: undefined,
      timespanError: false,
      isLoading: true,
      currentAvgValue: 0,
      customMapping: (element: object) => {
        const strTimeStamp: string = element['timestamp'];
        const strCluster: string = element['cluster'];
        const strDataCenter: string = element['dc'];
        const strInstance: string = element['instanz'];
        const strUtilization: string = element['count'];
        return { strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization };
      },
    };
  }

  componentDidMount() {
    // Get initial log data based on default values
    this.getLogData(this.state.dataSourceUrl);

    // Set the initial data refresh interval, default interval is 10 minutes
    const intervalId = setInterval(() => {
      this.getLogData(this.state.dataSourceUrl);
    }, 600000);
    this.setState<never>({ intervalId: intervalId });
  }

  getLogData = (dataSourceUrl: string) => {
    // TODO: implement other data sources
    const dataService = new SolrDataService();
    dataService
      .getLogDataFromSolr(dataSourceUrl)
      .then((data: any) => {
        // TODO: call dataparser from util folder in order to parse the log data
        const solrAdapter = new SolrAdapter();
        solrAdapter.receivedData(data.data, this.state.customMapping);

        this.setState(
          {
            // there is a bug, the last element is allways undefined
            temporalAxis: solrAdapter.temporalAxis,
            timeSeries: solrAdapter.timeSeries,
            clusterColors: solrAdapter.clusterColors,
            grid: solrAdapter.grid,
            maxH: solrAdapter.maxh,
            dataSourceError: false,
            isLoading: false,
            // raw timesereis Data for 2d graph
            rawTimeseriesData: data.data.response.docs,
            isRawTimeseriesDataLoaded: true,
            selectedPointInTime: solrAdapter.temporalAxis.length - 1,
          },
          () => {
            // Recalculate the slider positions
            this.calculateAndSetPositionOfPointInTimeSlider();
            this.calculateAndSetBoundariesOfTimespanSlider();
          }
        );
      })
      .catch((error: any) => {
        this.setState({ dataSourceError: true });
        console.log(error);
      });
  };

  render() {
    let TimeseriesNavigationChartComponent;
    if (this.state.isRawTimeseriesDataLoaded) {
      TimeseriesNavigationChartComponent = (
        <TimeseriesNavigationChart
          timeseriesData={this.state.rawTimeseriesData}
          updateTimespanData={this.updateTimespanData}
          resetSliderAndDates={this.updateSliderAndDates}
          updateCurrentAvg={this.updateCurrentAvg}
        />
      );
    } else {
      TimeseriesNavigationChartComponent = null;
    }
    return (
      <div className="App">
        <CubesVisualization
          data={this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime])}
          clusterColors={this.state.clusterColors}
          grid={this.state.grid}
          maxH={this.state.maxH}
          sliderMode={this.state.sliderMode}
          maxRangeSlider={this.state.temporalAxis.length - 2 > 0 ? this.state.temporalAxis.length - 2 : 1}
          // Ensure that max of slider is larger than min
          timespanValuesOfSlider={this.state.selectedTimespan}
          valueOfSlider={this.state.selectedPointInTime}
          accessChild={this.accessChild}
          selectedPointInTimeTimestamp={this.state.temporalAxis[this.state.selectedPointInTime]}
          selectedTimespanTimestamps={[
            this.state.temporalAxis[this.state.selectedTimespan[0]],
            this.state.temporalAxis[this.state.selectedTimespan[1]],
          ]}
          dataSourceError={this.state.dataSourceError}
          isLoading={this.state.isLoading}
          timespanAbsoluteTimestampLowerBound={this.state.timespanAbsoluteTimestampLowerBound}
          timespanAbsoluteTimestampUpperBound={this.state.timespanAbsoluteTimestampUpperBound}
          currentAvg={this.state.currentAvgValue}
        >
          {TimeseriesNavigationChartComponent}
        </CubesVisualization>
      </div>
    );
  }

  changeIntervalOfDataRefresh = (refreshInterval: number, refreshTimeUnit: string) => {
    // Delete previous data refresh interval
    clearInterval(this.state.intervalId);

    // Convert refresh interval from provided time unit to ms
    if (refreshTimeUnit === 'seconds') {
      refreshInterval = refreshInterval * 1000;
    } else if (refreshTimeUnit === 'minutes') {
      refreshInterval = refreshInterval * 60000;
    } else if (refreshTimeUnit === 'hours') {
      refreshInterval = refreshInterval * 3600000;
    } else {
      return;
    }

    // Set new data refresh interval
    const intervalId = setInterval(() => {
      this.getLogData(this.state.dataSourceUrl);
    }, refreshInterval);
    this.setState<never>({ intervalId: intervalId });
  };

  clearIntervalOfDataRefresh = () => {
    // Deactivates automatic data refresh
    clearInterval(this.state.intervalId);
  };

  accessChild = (stateElement, value) => {
    this.setState<never>({ [stateElement]: value }, () => {
      console.log(this.state.customMapping.toString());
    });
  };

  updateTimespanData = (newTimespanData: object) => {
    this.setState<never>(newTimespanData, () => {
      this.calculateAndSetBoundariesOfTimespanSlider();
    });
  };

  updateCurrentAvg = (avg: number) => {
    this.setState<never>({ currentAvgValue: avg });
  };

  updateSliderAndDates = (DateToReset: string) => {
    this.setState({ timeSelectionMode: 'pointInTime', pointInTimeTimestamp: DateToReset, sliderMode: 'pointInTime' });
    this.calculateAndSetPositionOfPointInTimeSlider();
  };

  calculateAndSetPositionOfPointInTimeSlider = () => {
    if (this.state.pointInTimeTimestamp) {
      const newPosition = this.state.temporalAxis.indexOf(this.state.pointInTimeTimestamp);
      if (newPosition !== -1) {
        this.setState({ selectedPointInTime: newPosition });
      } else {
        this.setState({ selectedPointInTime: this.state.temporalAxis.length - 2 });
      }
    }
  };

  calculateAndSetBoundariesOfTimespanSlider = () => {
    this.setState({ timespanError: false });
    const typeLowerBound = this.state.timespanTypeLowerBound;
    const typeUpperBound = this.state.timespanTypeUpperBound;
    let lowerBoundDatetime = this.state.timespanAbsoluteTimestampLowerBound;
    let upperBoundDatetime = this.state.timespanAbsoluteTimestampUpperBound;

    if (typeLowerBound === 'absolute' && typeUpperBound === 'absolute') {
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'last') {
      upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper');
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'next') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0] + 'Z';
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'last' && typeUpperBound === 'absolute') {
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower');
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'last' && typeUpperBound === 'last') {
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower');
      upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper');
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'last' && typeUpperBound === 'next') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'last' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0] + 'Z';
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower');
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime);
    } else if (typeLowerBound === 'next' && typeUpperBound === 'absolute') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'next' && typeUpperBound === 'next') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'now' && typeUpperBound === 'absolute') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'now' && typeUpperBound === 'next') {
      this.setState({ timespanError: true });
    } else if (typeLowerBound === 'now' && typeUpperBound === 'now') {
      this.setState({ selectedTimespan: [this.state.temporalAxis.length - 2, this.state.temporalAxis.length - 2] });
    } else {
      this.setState({ timespanError: true });
    }
  };

  getSliderPositions = (lowerBoundDatetime: string, upperBoundDatetime: string) => {
    // Check if lower bound datetime is earlier than upper bound datetime
    if (Date.parse(lowerBoundDatetime) < Date.parse(upperBoundDatetime)) {
      const dates = Array.from(this.state.timeSeries.keys()).sort();
      // TODO: remove fix bug -2 in solrAdapter
      let upperBoundSliderPosition = dates[dates.length - 2];
      let lowerBoundSliderPosition = dates[0];

      // Check if selected dates lies within the range of the log data set
      if (
        Date.parse(lowerBoundDatetime) <= Date.parse(upperBoundSliderPosition) &&
        Date.parse(upperBoundDatetime) >= Date.parse(lowerBoundSliderPosition)
      ) {
        let i = 0;
        dates.forEach(date => {
          if (Date.parse(date) <= Date.parse(upperBoundDatetime)) {
            upperBoundSliderPosition = date;
          }
          if (Date.parse(date) >= Date.parse(lowerBoundDatetime)) {
            if (i < 1) {
              i++;
              lowerBoundSliderPosition = date;
            }
          }
        });
        const lowerBound = this.state.temporalAxis.indexOf(lowerBoundSliderPosition);
        const upperBound = this.state.temporalAxis.indexOf(upperBoundSliderPosition);
        this.setState({ selectedTimespan: [lowerBound, upperBound] });
      } else {
        this.setState({ timespanError: true });
      }
    } else {
      this.setState({ timespanError: true });
    }
  };

  calculateRelativeDatetime = (timespanType, bound: 'lower' | 'upper') => {
    const timespanAmount = bound === 'upper' ? this.state.timespanAmountUpperBound : this.state.timespanAmountLowerBound;
    const timespanTimeUnit = bound === 'upper' ? this.state.timespanTimeUnitUpperBound : this.state.timespanTimeUnitLowerBound;
    const now = new Date();

    if (timespanType === 'last') {
      if (timespanTimeUnit === 'seconds') {
        now.setSeconds(now.getSeconds() - timespanAmount);
        now.setUTCMilliseconds(0);
      } else if (timespanTimeUnit === 'minutes') {
        now.setMinutes(now.getMinutes() - timespanAmount);
        now.setUTCSeconds(0, 0);
      } else if (timespanTimeUnit === 'hours') {
        now.setHours(now.getHours() - timespanAmount);
        now.setUTCMinutes(0, 0, 0);
      } else if (timespanTimeUnit === 'days') {
        now.setDate(now.getDate() - timespanAmount);
        now.setUTCHours(0, 0, 0, 0);
      } else {
        this.setState({ timespanError: true });
        return undefined;
      }
      return now.toISOString().split('.')[0] + 'Z';
    } else if (timespanType === 'next') {
      if (timespanTimeUnit === 'seconds') {
        now.setSeconds(now.getSeconds() + timespanAmount);
        now.setUTCMilliseconds(0);
      } else if (timespanTimeUnit === 'minutes') {
        now.setMinutes(now.getMinutes() + timespanAmount);
        now.setUTCSeconds(0, 0);
      } else if (timespanTimeUnit === 'hours') {
        now.setHours(now.getHours() + timespanAmount);
        now.setUTCMinutes(0, 0, 0);
      } else if (timespanTimeUnit === 'days') {
        now.setDate(now.getDate() + timespanAmount);
        now.setUTCHours(0, 0, 0, 0);
      } else {
        this.setState({ timespanError: true });
        return undefined;
      }
      return now.toISOString().split('.')[0] + 'Z';
    } else {
      this.setState({ timespanError: true });
      return undefined;
    }
  };

  setDataSource = (dataSource: any) => {
    this.setState({ dataSource: dataSource.target.value });
  };

  setDataSourceUrl = (dataSourceUrl: string) => {
    this.getLogData(dataSourceUrl);
    this.setState({ dataSourceUrl: dataSourceUrl });
  };

  setSolrUrlPart = (solrUrlPartName: string, solrUrlPart: string) => {
    this.setState<never>(
      {
        [solrUrlPartName]: solrUrlPart,
      },
      () => {
        const dataSourceUrl = this.state.solrBaseUrl.concat(this.state.solrCore, this.state.solrQuery);
        this.getLogData(dataSourceUrl);
      }
    );
  };
}
