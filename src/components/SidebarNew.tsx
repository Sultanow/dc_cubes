import React from 'react';
import { NavLink } from "react-router-dom";
import clsx from 'clsx';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { BarChart, Settings, Tune, Description } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import './Sidebar.css'

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      backgroundColor: "#f1f3f9",
      color: '#000'
    },
    appBar: {
      zIndex: theme.zIndex.drawer,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      backgroundColor: "#1b76f0"
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
      backgroundColor: "#1b76f0", 
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      // padding: theme.spacing(3),
    },
  }),
);
interface MyProps {
  children?: React.ReactNode;
  dataSource?: string
}
// This is a React functional Component
export default function MiniDrawer(props: React.PropsWithChildren<MyProps>) {
  const classes = useStyles({});
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  function handleDrawer() {
    setOpen(!open);
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        open={open}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawer} style={{ color: "#fff"}}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List style={{ color: "#fff"}}>
          <NavLink to="/" style={{ textDecoration: 'none' }} className="sidebar-item-inactive" activeClassName="sidebar-item-active" exact={true} >
            <ListItem button>
              <ListItemIcon style={{ marginLeft: '10px', color: "#fff"}} ><BarChart /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </NavLink>
          <ListItem button>
            <ListItemIcon style={{ marginLeft: '10px', color: "#fff"}}><Tune /></ListItemIcon>
            <ListItemText primary="Parameter verwalten" />
          </ListItem>
          <ListItem button>
            <ListItemIcon style={{ marginLeft: '10px', color: "#fff"}}><Description /></ListItemIcon>
            <ListItemText primary="Bericht erstellen" />
          </ListItem>
        </List>
        <Divider />
        <List style={{ textDecoration: 'none', color: "#fff"}}>
          <NavLink to={`/data-sources/${props.dataSource}`} style={{ textDecoration: 'none' }} className="sidebar-item-inactive" activeClassName="sidebar-item-active" exact={true} >
            <ListItem button>
              <ListItemIcon style={{ marginLeft: '10px', color: "#fff"}}><FontAwesomeIcon icon={faCoins} style={{ marginLeft: '2px', width: '22px', height: '20px' }} /></ListItemIcon>
              <ListItemText primary="Datenquelle" />
            </ListItem>
          </NavLink>
          <ListItem button>
            <ListItemIcon style={{ marginLeft: '10px', color: "#fff"}} ><Settings /></ListItemIcon>
            <ListItemText primary="Einstellungen" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        {props.children}
      </main>
    </div>
  );
}