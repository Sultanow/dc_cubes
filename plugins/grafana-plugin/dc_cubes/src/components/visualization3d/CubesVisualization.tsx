import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DCState from '../../../../../../src/model/DCState';
import Datacenter from '../../../../../../src/model/Datacenter';
import Cluster from '../../../../../../src/model/Cluster';
import Instance from '../../../../../../src/model/Instance';
//import LoadingPlaceholder from '@grafana/ui';
import './CubesVisualization.css';
import LoadingOverlay from 'react-loading-overlay';
import BarLoader from 'react-spinners/BarLoader';
/* import Filter from "../Filter" */

interface CubesVisProps {
  data: DCState;
  aggregatedData: any;
  grid: Map<string, number[]>;
  clusterColors: {};
  maxH: number;
  timeSelectionMode: 'pointInTime' | 'timespan';
  accessApp: any;
  temporalAxis: string[];
  dataSourceError: boolean;
  children?: React.ReactNode;
  isLoading: boolean;
  pointInTimeTimestamp: string;
  timespanTimestampLowerBound: string;
  timespanTimestampUpperBound: string;
  lastHistoricDate: Date;
}

interface Bar {
  id: string;
  cube: any;
  datacenter: string;
  cluster: string;
}

class CubesVisualization extends React.Component<CubesVisProps> {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mouse: THREE.Vector2;
  INTERSECTED: any;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  controls: OrbitControls;
  bars: Bar[];
  textSprites: any[];
  barPlaceholders: any[];
  currentHelperBox: THREE.Box3Helper;
  frameId: number;

  maxHeightOfBar = 800;

  constructor(props: CubesVisProps) {
    super(props);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 3000);
    // set initial camera position
    this.camera.position.set(500, 1000, 1200);

    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.raycaster = new THREE.Raycaster();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.bars = [];
    this.textSprites = [];
    this.barPlaceholders = [];
    this.frameId = 0;
  }

  render() {
    const selectedPointInTimeTimestamp: string = this.props.pointInTimeTimestamp;

    const { timeSelectionMode, isLoading } = this.props;
    // TODO: use Date.tolocaleDate("en_us", options) after UTC Timezone fix https://stackoverflow.com/a/50293232
    const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let timestamp = <div></div>;
    let predictionWarning: JSX.Element = <div></div>;
    if (timeSelectionMode === 'pointInTime') {
      timestamp = (
        <div className="date">
          {daysOfTheWeek[new Date(selectedPointInTimeTimestamp).getDay()]} {selectedPointInTimeTimestamp}
        </div>
      );
      if (this.dateIsPrediction(new Date(selectedPointInTimeTimestamp))) {
        predictionWarning = <div className="predictionWarning"> Achtung: Vorhersage!</div>;
      }
    } else {
      const dateLowerBoundStr: string = this.props.timespanTimestampLowerBound;
      const dateLowerBound: Date = new Date(dateLowerBoundStr);
      const dateUpperBoundStr: string = this.props.timespanTimestampUpperBound;
      const dateUpperBound: Date = new Date(dateUpperBoundStr);
      timestamp = (
        <div className="date">
          {daysOfTheWeek[dateLowerBound.getDay()]} {dateLowerBoundStr} - {daysOfTheWeek[dateUpperBound.getDay()]} {dateUpperBoundStr}
        </div>
      );
      if (this.dateIsPrediction(dateLowerBound) || this.dateIsPrediction(dateUpperBound)) {
        predictionWarning = <div className="predictionWarning"> Achtung: Vorhersage!</div>;
      }
    }

    return (
      <React.Fragment>
        {/* <Filter /> */}
        <LoadingOverlay active={isLoading} spinner={<BarLoader color={'#f7b613'} css={'background-color: #1b76ef'} />} text="Loading Data...">
          <div className="cubes-visualization">
            <div id="cubes-visualization" />
          </div>
          <div id="selection-visualization" className="selection-visualization">
            <header className="content-header" style={{ marginTop: '10px' }}>
              <div className="param-info-container">
                <div style={{ marginLeft: '10px', marginBottom: '5px' }}>{timestamp}</div>
              </div>
              <div>{predictionWarning}</div>
            </header>
            {/* The 2D Navigation chart is rendered in the line below */}
            {this.props.children}
          </div>
        </LoadingOverlay>
      </React.Fragment>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeCanvasToDisplaySize);
    this.initVis();
    // necessary for react-router
    if (this.props.dataSourceError === false) {
      this.setBarPlaceholders();
      this.createCubeData();
    }
    this.renderVis();
  }
  componentDidUpdate() {
    if (this.props.dataSourceError === false) {
      this.setBarPlaceholders();
      this.createCubeData();
    }
    this.renderVis();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.resizeCanvasToDisplaySize);
    const visFromDom = document.getElementById('cubes-visualization');
    if (visFromDom) {
      visFromDom.removeChild(this.renderer.domElement);
    }
  }

  initVis = () => {
    this.scene.background = new THREE.Color(0xffffff);

    const visFromDom = document.getElementById('cubes-visualization');
    if (visFromDom) {
      visFromDom.appendChild(this.renderer.domElement);
    }

    // this.render();
    // allows movement with mouseclicks
    this.controls.addEventListener('change', this.renderVis.bind(this));

    // limit camera distances
    this.controls.maxDistance = 2000;
    this.controls.minDistance = 400;

    // eventlistener for mouse movement. is needed for onHower and onClick logic
    document.addEventListener('mousemove', this.onHover, false);
    document.addEventListener('mouseup', this.onCubeclick, false);

    this.createLight();
  };

  // TODO: Rename function because confusing
  createCubeData = () => {
    // removes bars of the last selected timestamp
    for (let index = 0; index < this.bars.length; index++) {
      this.scene.remove(this.bars[index].cube);
      this.bars[index].cube.geometry.dispose();
      this.bars[index].cube.geometry = null;
      this.bars[index].cube.material.dispose();
      this.bars[index].cube.material = null;
      // this.bars[index].dispose();
      this.bars[index] = undefined;
    }
    this.bars.length = 0;

    // removes text sprites of the last selected timestamp
    for (let index = 0; index < this.textSprites.length; index++) {
      this.textSprites[index].geometry.dispose();
      this.textSprites[index].material.dispose();
      this.scene.remove(this.textSprites[index]);
    }
    this.textSprites.length = 0;
    this.renderer.renderLists.dispose();
    if (this.props.data == null) {
      return;
    }
    this.props.data.datacenters.forEach((datacenter: Datacenter, keyDC: string) => {
      //set up view data
      const clusters = datacenter.clusters;
      clusters.forEach((valueCluster: Cluster, keyCluster: string) => {
        const instances = valueCluster.instances;
        instances.forEach((valueInstance: Instance, keyInstance: string) => {
          const h = valueInstance.utilization;
          const gridKey: string = keyDC + '_' + keyCluster + '_' + keyInstance;
          const clusterKey = keyDC + '_' + keyCluster;

          const gridValue: number[] = this.props.grid.get(gridKey)!;

          const x = gridValue[0];
          const z = gridValue[1];

          // TODO: Refactor, too many arguments
          this.createBar(
            x * 150,
            z * 150,
            this.scaleLog(h, this.props.maxH),
            h.toString(),
            this.props.clusterColors[clusterKey],
            keyDC,
            keyCluster,
            gridKey
          );
        });
      });
    });
  };

  generateRandomColor = (): string => {
    return '#000000'.replace(/0/g, () => {
      return (~~(Math.random() * 16)).toString(16);
    });
  };

  createBar = (x: number, z: number, h: number, textLabel: string, color: number, datacenter: string, cluster: string, instanceId: string) => {
    // Cube init
    const geometry = new THREE.BoxBufferGeometry(40, h, 40);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, h / 2, 0));

    const material = new THREE.MeshLambertMaterial({
      color: color,
    });

    const cube = new THREE.Mesh(geometry, material);

    // positioning
    cube.position.x = x;
    cube.position.z = z;

    cube.castShadow = true;
    cube.receiveShadow = true;
    const textSprite = this.createTextSprite(textLabel);
    textSprite.position.x = x;
    textSprite.position.z = z;
    textSprite.position.y = h + 15;
    this.scene.add(cube);
    this.scene.add(textSprite);

    const geo = new THREE.EdgesGeometry(cube.geometry); // or WireframeGeometry
    const mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
    const wireframe = new THREE.LineSegments(geo, mat);
    cube.add(wireframe);
    this.textSprites.push(textSprite);
    // save the datacenter and cluster for each cube
    cube.userData = {
      id: instanceId,
      datacenter: datacenter,
      cluster: cluster,
    };

    const bar: Bar = { id: instanceId, cube: cube, datacenter: datacenter, cluster: cluster };
    this.bars.push(bar);

    geometry.dispose();
    material.dispose();
    geo.dispose();
    mat.dispose();
    this.renderer.renderLists.dispose();
  };

  createTextSprite = message => {
    const fontface = 'Helvetica';
    const fontsize = 80;
    const canvas = document.createElement('canvas')!;
    const context = canvas.getContext('2d')!;
    context.font = 'bold ' + fontsize + 'px ' + fontface;

    // text color
    context.fillStyle = 'rgba(0, 0, 0, 1.0)';
    context.fillText(message, 0, fontsize);

    // canvas contents will be used for a texture
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);
    sprite.center.set(0.1, 0.5);
    texture.dispose();
    return sprite;
  };

  createBarPlaceholder = (xPosition: number, zPosition: number) => {
    const geometry = new THREE.PlaneBufferGeometry(40, 40);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);

    const geo = new THREE.EdgesGeometry(plane.geometry); // or WireframeGeometry
    const mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 1 });
    const wireframe = new THREE.LineSegments(geo, mat);
    plane.rotation.x = Math.PI / 2;
    plane.position.x = xPosition;
    plane.position.z = zPosition;
    plane.add(wireframe);
    this.barPlaceholders.push(plane);
    this.scene.add(plane);

    geometry.dispose();
    material.dispose();
    geo.dispose();
    mat.dispose();
    this.renderer.renderLists.dispose();
  };

  setBarPlaceholders = () => {
    // removes bar placeholdes of the last selected timestamp
    for (let index = 0; index < this.barPlaceholders.length; index++) {
      this.barPlaceholders[index].geometry.dispose();
      this.barPlaceholders[index].material.dispose();
      this.scene.remove(this.barPlaceholders[index]);
    }
    this.barPlaceholders = [];
    this.renderer.renderLists.dispose();

    this.props.grid.forEach(element => {
      this.createBarPlaceholder(element[0] * 150, element[1] * 150);
    });
  };

  scaleLog = (hvalue, hmax) => {
    const maxh = Math.log(hmax);
    const adjustfactor = +(this.maxHeightOfBar / maxh).toFixed(4);

    //log zwischen +0.1 - +1 problem (negativ bzw 0)
    if (hvalue <= 1 && hvalue >= 0.1) {
      return (Math.log(2 - (1 - hvalue)) * adjustfactor) / 2;
    }
    return Math.log(hvalue) * adjustfactor;
  };

  createLight = () => {
    const ambient = new THREE.AmbientLight(0x999999);
    const spot = new THREE.SpotLight(0xffffff, 0.3);

    spot.position.set(0, 5000, 0);
    spot.castShadow = true;

    this.scene.add(ambient, spot);
  };

  onHover = (event: any) => {
    // calculate mouse position in normalized device coordinates acordign to scene width and height
    // (-1 to +1) for both components
    const intersects = this.getIntersections(event);
    if (intersects.length > 0) {
      // interaction on hover
      this.changeColorOfHoveredCube(intersects);
      this.drawHelperBox();
    }
  };
  onCubeclick = (event: any) => {
    // check if middle mouse button was clicked
    if (event.which === 2) {
      const intersects = this.getIntersections(event);
      if (intersects.length > 0) {
        alert(intersects[0].object.name);
      }
    }
  };

  getIntersections(event: any) {
    this.updateMousePositionProperty(event);
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // calculate objects intersecting the picking ray
    return this.raycaster.intersectObjects(this.scene.children);
  }

  updateMousePositionProperty(event: any) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  drawHelperBox() {
    if (this.INTERSECTED != null) {
      const datacenter = this.INTERSECTED.userData.datacenter;
      const cluster = this.INTERSECTED.userData.cluster;

      if (datacenter != null && cluster != null) {
        const geom = new THREE.Geometry();
        const allBarsOfThisCluster = this.bars.filter(bar => bar.cluster === cluster);
        const gset = [];

        allBarsOfThisCluster.forEach(bar => {
          const cube = bar.cube;
          const boxGeom = new THREE.Geometry().fromBufferGeometry(cube.geometry);
          geom.merge(boxGeom, cube.matrix);
          gset.push(boxGeom);
        });

        const bufGeometry = new THREE.BufferGeometry().fromGeometry(geom);
        bufGeometry.computeBoundingBox();
        const bbox = bufGeometry.boundingBox.clone();

        // remove old helper box
        if (this.currentHelperBox != null) {
          this.scene.remove(this.currentHelperBox);
        }

        // set new helper box as the current one
        const helper = new THREE.Box3Helper(bbox, new THREE.Color(0xff0000));
        this.currentHelperBox = helper;
        // add the class property instead of the variable to ensure only one is shown at all times
        this.scene.add(this.currentHelperBox);

        this.renderVis();
      }
    }
  }

  changeColorOfHoveredCube(intersects: THREE.Intersection[]) {
    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.type === 'Mesh') {
          this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
        }

        this.INTERSECTED = intersects[0].object;
        if (this.INTERSECTED.type === 'Mesh') {
          this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
          this.INTERSECTED.material.emissive.setHex(0xff0000);
          this.renderVis();
        }
      }
    } else {
      if (this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.type === 'Mesh') {
        this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
        this.renderVis();
      }
      this.INTERSECTED = null;
    }
  }

  dateIsPrediction(date: Date) {
    if (date == null || this.props.lastHistoricDate == null) {
      return false;
    }

    return date.getTime() > this.props.lastHistoricDate.getTime();
  }

  // draw Scene
  renderVis() {
    // console.log("RENDER");
    this.resizeCanvasToDisplaySize();
    this.renderer.render(this.scene, this.camera);
  }

  // run visualization loop (update, render, repeat)
  loopVis = () => {
    this.renderVis();
    this.frameId = window.requestAnimationFrame(this.loopVis);
  };

  resizeCanvasToDisplaySize = () => {
    const canvas = this.renderer.domElement;
    const width = canvas ? canvas.parentElement.parentElement.clientWidth : null;
    const height = canvas ? canvas.parentElement.parentElement.clientHeight : null;
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      // set render target sizes here
    }
  };
}

export default CubesVisualization;
