import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle
} from '@elastic/eui';

import { CoreStart } from '..\..\../../src/core/public';
import { NavigationPublicPluginStart } from '..\..\../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '..\..\../../src/plugins/data/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      flexGrow: 1,
      padding: '2px 4px',
      display: 'flex',
      width: 400,
      margin: 'auto'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    iconButton: {
      padding: 10
    }
  })
);

class Row { 
  queueName:string;
  queueEnteredTime:string;
  queueEnteredSize:string;
  queueLeftTime:string;
  queueLeftSize:string;

  constructor(queueName:string, queueEnteredTime:string, queueEnteredSize:string, queueLeftTime:string, queueLeftSize:string) { 
     this.queueName = queueName;
     this.queueEnteredTime = queueEnteredTime;
     this.queueEnteredSize = queueEnteredSize;
     this.queueLeftTime = queueLeftTime;
     this.queueLeftSize = queueLeftSize;
  }   
}

const itemTableRows = new Array<Row>();

interface BshQueueVizAppDeps {
  basename: string;
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export const BshQueueVizApp = ({ basename, http, navigation, data }: BshQueueVizAppDeps) => {
  // Use React hooks to manage state.
  const [itemSearch, setItemSearch] = useState<string | string>(); 
  const [statusText, setStatusText] = useState<string | string>();
  const [rows, setTable] = useState<Array<Row> | Array<Row>>(itemTableRows);
  const [open, setOpen] = React.useState(false);

  const onClickHandler = () => {

    let gte = "";
    let lte = "";

    if ((data.query.timefilter.timefilter.getTime().from == data.query.timefilter.history.history.items[0].from) && (data.query.timefilter.timefilter.getTime().to == data.query.timefilter.history.history.items[0].to)) {
      gte = data.query.timefilter.timefilter.getTime().from;
      lte = data.query.timefilter.timefilter.getTime().to;
    } else {
      gte = data.query.timefilter.history.history.items[0].from;
      lte = data.query.timefilter.history.history.items[0].to;
    }

    const body = { item: itemSearch, gte: gte, lte: lte };
    http.post("/api/bsh_queue_viz/itemsearch", {body: JSON.stringify(body)}).then(res => {
      //console.log(res.data.aggregations);
      let buckets = res.data.aggregations.group_by_queue.buckets;
      let bucketDetails = "";
      itemTableRows.splice(0);
      buckets.forEach(function (item, index) {
        let queueEntered = item.queue_enter.hits.hits[0]._source;
        let queueLeft = item.queue_left.hits.hits[0]._source;
        itemTableRows.push(new Row(item.key, queueEntered.timestamp, queueEntered.size, queueLeft.timestamp, queueLeft.size));
        setTable(itemTableRows);
      });
      //1400457484
      setStatusText("Searched for " + itemSearch + ", buckets found: " + buckets.length + bucketDetails)
      setOpen(true);
    });
  };  
  
  const handleChange = (event) => {
    setItemSearch(event.target.value)
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const classes = useStyles();

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <navigation.ui.TopNavMenu appName={ PLUGIN_ID } showSearchBar={true} />
      <EuiPage restrictWidth="1000px">
        <EuiPageBody>
          <EuiPageHeader>
            <EuiTitle size="l">
              <h1>
                <div id="bshQueueViz.helloWorldText">
                {PLUGIN_NAME}
                </div>
              </h1>
            </EuiTitle>
          </EuiPageHeader>
          <EuiPageContent style={{ border: 'none', boxShadow: 'none', backgroundColor: '#f5f5f5' }}>
            <EuiPageContentBody>
              <Paper component="form" className={classes.search}>
                <InputBase id="bshQueueViz.itemSearchField" className={classes.input} placeholder="Search Item" onChange={handleChange} />
                <IconButton className={classes.iconButton} onClick={onClickHandler}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </EuiPageContentBody>
          </EuiPageContent>
          <Box m={2} />
          <EuiPageContent>
            <EuiPageContentBody>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Queue</TableCell>
                      <TableCell align="right">time entered</TableCell>
                      <TableCell align="right">size when entered</TableCell>
                      <TableCell align="right">time left</TableCell>
                      <TableCell align="right">size when left</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                    <TableRow key={row.queueName}>
                      <TableCell component="th" scope="row">{row.queueName}</TableCell>
                      <TableCell align="right">{row.queueEnteredTime}</TableCell>
                      <TableCell align="right">{row.queueEnteredSize}</TableCell>
                      <TableCell align="right">{row.queueLeftTime}</TableCell>
                      <TableCell align="right">{row.queueLeftSize}</TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box m={6} />
              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">{statusText}</Alert>
              </Snackbar>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </Router>
  );
};
