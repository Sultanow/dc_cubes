import React from 'react'
import * as THREE from 'three'
import { Form } from 'react-bootstrap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import DCState from '../../model/DCState'
import Datacenter from '../../model/Datacenter'
import Cluster from '../../model/Cluster'
import Instance from '../../model/Instance'
import './CubesVisualization.css'
import LoadingOverlay from "react-loading-overlay"
import BarLoader from 'react-spinners/BarLoader'
import AggregationType from '../../model/AggregationType'
/* import Filter from "../Filter" */

interface CubesVisProps {
    data: DCState
    aggregatedData: any
    grid: Map<string, Array<number>>
    clusterColors: {}
    maxH: number
    timeSelectionMode: 'pointInTime' | 'timespan'
    accessApp: any
    temporalAxis: string[]
    dataSourceError: boolean
    children?: React.ReactNode
    isLoading: boolean
    pointInTimeTimestamp: string
    timespanTimestampLowerBound: string
    timespanTimestampUpperBound: string
    lastHistoricDate: Date
    aggregationType: AggregationType
    selectedMeasure: string
    updateAggregationType: any
    updateSelectedMeasure: any
    aggregationTypes: object
    listOfAllMeasures: object
}

interface Bar {
    id: string
    cube: any
    datacenter: string
    cluster: string
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

    maxHeightOfBar: number = 800;

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
        this.textSprites = []
        this.barPlaceholders = []
        this.frameId = 0
    }

    render() {
        const selectedPointInTimeTimestamp: string = this.props.pointInTimeTimestamp;

        let { timeSelectionMode, isLoading, listOfAllMeasures, aggregationTypes, aggregationType, selectedMeasure } = this.props;
        // TODO: use Date.tolocaleDate("en_us", options) after UTC Timezone fix https://stackoverflow.com/a/50293232
        const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let timestamp = <div></div>;
        let predictionWarning: JSX.Element = <div></div>;
        if (timeSelectionMode === 'pointInTime') {
            timestamp = <div className="date">{daysOfTheWeek[new Date(selectedPointInTimeTimestamp).getDay()]} {selectedPointInTimeTimestamp}</div>;
            if (this.dateIsPrediction(new Date(selectedPointInTimeTimestamp))) {
                predictionWarning = <div className="predictionWarning"> Achtung: Vorhersage!</div>
            }
        } else {
            let dateLowerBoundStr: string = this.props.timespanTimestampLowerBound;
            let dateLowerBound: Date = new Date(dateLowerBoundStr);
            let dateUpperBoundStr: string = this.props.timespanTimestampUpperBound;
            let dateUpperBound: Date = new Date(dateUpperBoundStr);
            timestamp = <div className="date">{daysOfTheWeek[dateLowerBound.getDay()]} {dateLowerBoundStr} - {daysOfTheWeek[dateUpperBound.getDay()]} {dateUpperBoundStr}</div>;
            if (this.dateIsPrediction(dateLowerBound) || this.dateIsPrediction(dateUpperBound)) {
                predictionWarning = <div className="predictionWarning"> Achtung: Vorhersage!</div>
            }
        }

        return (
            <div className="cubes-visualization col-md-9">
                {/* <Filter /> */}
                <header className="content-header">
                    <div className="param-info-container">
                        <Form inline>
                            <Form.Control size="sm" className="selectAggregation" as="select" name="aggregationType" value={aggregationType} onChange={this.handleChange}>
                                {
                                    Object.keys(aggregationTypes).map((aggregationType, index) => (
                                        <option key={index} value={aggregationType}>{aggregationTypes[aggregationType]}</option>
                                    ))
                                }
                            </Form.Control>
                            <Form.Control size="sm" className="selectMeasure" as="select" name="selectedMeasure" value={selectedMeasure} onChange={this.handleChange}>
                                {
                                    Object.keys(listOfAllMeasures).map((measure, index) => (
                                        <option key={index} value={measure}>{listOfAllMeasures[measure]}</option>
                                    ))
                                }
                            </Form.Control>
                        </Form>
                    </div>
                    {/* <div>
                        <Button className="btn-util">
                            <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px" }} />
                        </Button>
                        <Button className="btn-util">
                            <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                        </Button>
                    </div> */}
                </header>
                <div style={{ height: "53vh" }} className="content-container d-flex justify-content-center">
                    <LoadingOverlay
                        active={isLoading}
                        spinner={<BarLoader
                            color={"#f7b613"}
                            css={"background-color: #1b76ef"}
                        />}
                        text='Loading Data...'
                    >
                        <div style={{ height: "100%", width: "100%" }}>
                            <div id="cubes-visualization" style={{ height: "100%", width: "100%" }} />
                        </div>
                    </LoadingOverlay>
                </div>
                <header className="content-header" style={{ marginTop: "10px" }}>
                    <div className="param-info-container">
                        <div style={{ marginLeft: "10px" }}>{timestamp}</div>
                    </div>
                    <div>{predictionWarning}</div>
                    {/* <div>
                        <Button className="btn-util">
                            <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px" }} />
                        </Button>
                        <Button className="btn-util">
                            <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                        </Button>
                    </div> */}
                </header>
                <div className="content-container">
                    {/* The 2D Navigation chart is rendered in the line below */}
                    {this.props.children}
                </div>
            </div>
        )
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeCanvasToDisplaySize);
        this.initVis();
        // necessary for react-router
        if (this.props.dataSourceError === false) {
            this.setBarPlaceholders();
            this.createCubeData()
        }
        this.renderVis()
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
        const visFromDom = document.getElementById("cubes-visualization");
        if (visFromDom) {
            visFromDom.removeChild(this.renderer.domElement);
        }
    };

    initVis = () => {
        this.scene.background = new THREE.Color(0xffffff);

        const visFromDom = document.getElementById("cubes-visualization");
        if (visFromDom) visFromDom.appendChild(this.renderer.domElement);

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
        if (this.props.data == null) return;
        this.props.data.datacenters.forEach((datacenter: Datacenter, keyDC: string) => {
            //set up view data
            let clusters = datacenter.clusters;
            clusters.forEach((valueCluster: Cluster, keyCluster: string) => {
                let instances = valueCluster.instances;
                instances.forEach((valueInstance: Instance, keyInstance: string) => {
                    console.log("valueInstance.utilization" + valueInstance.utilization);
                    var h = (Math.round(valueInstance.utilization * 100) / 100).toFixed(2);
                    let gridKey: string = keyDC + "_" + keyCluster + "_" + keyInstance;
                    let clusterKey = keyDC + "_" + keyCluster;

                    let gridValue: Array<number> = this.props.grid.get(gridKey)!;

                    var x = gridValue[0];
                    var z = gridValue[1];

                    // TODO: Refactor, too many arguments
                    this.createBar(x * 150, z * 150, this.scaleLog(h, this.props.maxH), h.toString(),
                        this.props.clusterColors[clusterKey], keyDC, keyCluster, gridKey);

                })
            })
        })
    };

    generateRandomColor = (): string => {
        return "#000000".replace(/0/g, () => { return (~~(Math.random() * 16)).toString(16); });
    }

    createBar = (x: number, z: number, h: number, textLabel: string, color: number,
        datacenter: string, cluster: string, instanceId: string) => {
        // Cube init
        var geometry = new THREE.BoxBufferGeometry(40, h, 40);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, h / 2, 0));

        var material = new THREE.MeshLambertMaterial({
            color: color
        });

        var cube = new THREE.Mesh(geometry, material);


        // positioning
        cube.position.x = x;
        cube.position.z = z;


        cube.castShadow = true;
        cube.receiveShadow = true;
        var textSprite = this.createTextSprite(textLabel);
        textSprite.position.x = x;
        textSprite.position.z = z;
        textSprite.position.y = h + 15;
        this.scene.add(cube);
        this.scene.add(textSprite);

        var geo = new THREE.EdgesGeometry(cube.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
        var wireframe = new THREE.LineSegments(geo, mat);
        cube.add(wireframe);
        this.textSprites.push(textSprite);
        // save the datacenter and cluster for each cube
        cube.userData = {
            id: instanceId,
            datacenter: datacenter,
            cluster: cluster
        }

        let bar: Bar = { id: instanceId, cube: cube, datacenter: datacenter, cluster: cluster };
        this.bars.push(bar);

        geometry.dispose();
        material.dispose();
        geo.dispose();
        mat.dispose();
        this.renderer.renderLists.dispose();

    };

    createTextSprite = (message) => {
        var fontface = 'Helvetica';
        var fontsize = 80;
        var canvas = document.createElement('canvas')!;
        var context = canvas.getContext('2d')!;
        context.font = "bold " + fontsize + "px " + fontface;

        // text color
        context.fillStyle = 'rgba(0, 0, 0, 1.0)';
        context.fillText(message, 0, fontsize);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 50, 1.0);
        sprite.center.set(0.1, 0.5);
        texture.dispose()
        return sprite;
    }

    createBarPlaceholder = (xPosition: number, zPosition: number) => {
        var geometry = new THREE.PlaneBufferGeometry(40, 40);
        var material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);

        var geo = new THREE.EdgesGeometry(plane.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 1 });
        var wireframe = new THREE.LineSegments(geo, mat);
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
    }

    setBarPlaceholders = () => {

        // removes bar placeholdes of the last selected timestamp
        for (let index = 0; index < this.barPlaceholders.length; index++) {
            this.barPlaceholders[index].geometry.dispose()
            this.barPlaceholders[index].material.dispose();
            this.scene.remove(this.barPlaceholders[index]);
        }
        this.barPlaceholders = []
        this.renderer.renderLists.dispose();

        this.props.grid.forEach((element) => {
            this.createBarPlaceholder(element[0] * 150, element[1] * 150);
        });

    }

    scaleLog = (hvalue, hmax) => {
        let maxh = Math.log(hmax);
        let adjustfactor = +((this.maxHeightOfBar / maxh).toFixed(4))

        //log zwischen +0.1 - +1 problem (negativ bzw 0)
        if (hvalue <= 1 && hvalue >= 0.1) {
            return (Math.log(2 - (1 - hvalue)) * adjustfactor) / 2
        }
        return Math.log(hvalue) * adjustfactor

    }

    createLight = () => {
        var ambient = new THREE.AmbientLight(0x999999);
        var spot = new THREE.SpotLight(0xffffff, 0.3);

        spot.position.set(0, 5000, 0);
        spot.castShadow = true;

        this.scene.add(ambient, spot);
    }

    onHover = (event: any) => {
        // calculate mouse position in normalized device coordinates acordign to scene width and height
        // (-1 to +1) for both components
        let intersects = this.getIntersections(event);
        if (intersects.length > 0) {
            // interaction on hover
            this.changeColorOfHoveredCube(intersects);
            this.drawHelperBox();
        }
    };
    onCubeclick = (event: any) => {
        // check if middle mouse button was clicked
        if (event.which === 2) {

            let intersects = this.getIntersections(event);
            if (intersects.length > 0) {
                alert(intersects[0].object.name);
            }
        }
    }

    getIntersections(event: any) {

        this.updateMousePositionProperty(event);
        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // calculate objects intersecting the picking ray
        return this.raycaster.intersectObjects(this.scene.children);
    }

    updateMousePositionProperty(event: any) {
        var rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    drawHelperBox() {
        if (this.INTERSECTED != null) {
            let datacenter = this.INTERSECTED.userData.datacenter;
            let cluster = this.INTERSECTED.userData.cluster;

            if (datacenter != null && cluster != null) {
                let geom = new THREE.Geometry();
                let allBarsOfThisCluster = this.bars.filter(bar => bar.cluster === cluster);
                let gset = [];

                allBarsOfThisCluster.forEach(bar => {
                    let cube = bar.cube;
                    let boxGeom = new THREE.Geometry().fromBufferGeometry(cube.geometry);
                    geom.merge(boxGeom, cube.matrix);
                    gset.push(boxGeom);
                });

                let bufGeometry = new THREE.BufferGeometry().fromGeometry(geom);
                bufGeometry.computeBoundingBox();
                let bbox = bufGeometry.boundingBox.clone();

                // remove old helper box 
                if (this.currentHelperBox != null) this.scene.remove(this.currentHelperBox);

                // set new helper box as the current one
                let helper = new THREE.Box3Helper(bbox, new THREE.Color(0xff0000));
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
                if (this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.type === "Mesh") this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);

                this.INTERSECTED = intersects[0].object;
                if (this.INTERSECTED.type === "Mesh") {
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                    this.INTERSECTED.material.emissive.setHex(0xff0000);
                    this.renderVis();
                }
            }
        } else {
            if (this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.type === "Mesh") {
                this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                this.renderVis();
            }
            this.INTERSECTED = null;
        }
    };

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
    };

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
    }

    handleChange = (e) => {
        const stateElement = e.target.name

        if (stateElement === 'selectedMeasure') {
            this.props.updateSelectedMeasure(e.target.value)
        } else {
            this.props.updateAggregationType(e.target.value)
        }
    }
}

export default CubesVisualization;