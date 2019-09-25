import React from 'react'
import * as THREE from 'three'
import { Container } from 'react-bootstrap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import DCState from '../../model/DCState'
import Datacenter from '../../model/Datacenter'
import Cluster from '../../model/Cluster'
import Instance from '../../model/Instance'
import PointInTimeSlider from '../slider/PointInTimeSlider'
import TimeSpanSlider from '../slider/TimespanSlider'
import './CubesVisualisation.css'
import TimeseriesNavigationChart from '../visualization2d/TimeseriesNavigationChart'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faCogs } from '@fortawesome/free-solid-svg-icons'
import SectionRight from "../../components/SectionRight";
import LoadingOverlay from "react-loading-overlay";
import BarLoader from 'react-spinners/BarLoader'

interface CubesVisProps {
    data: DCState
    grid: Map<string, Array<number>>
    clusterColors: {}
    maxH: number
    sliderMode: 'pointInTime' | 'timespan' | 'hidden'
    maxRangeSlider: number
    valueOfSlider: number
    timespanValuesOfSlider: [number, number]
    selectedPointInTimeTimestamp: string
    selectedTimespanTimestamp: string
    accessChild: any
    dataSourceError: boolean
    children?: React.ReactNode
}

class CubesVisualisation extends React.Component<CubesVisProps> {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mouse: THREE.Vector2;
    INTERSECTED: any;
    renderer: THREE.WebGLRenderer;
    raycaster: THREE.Raycaster;
    controls: OrbitControls;
    bars: any[];
    textSprites: any[];
    barPlaceholders: any[];

    frameId: number;

    sceneWidth = window.innerWidth / 2;
    sceneHeight = window.innerHeight / 2;

    maxHeightOfbar = 800;

    isLoading: boolean = true;

    constructor(props: CubesVisProps) {
        super(props);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.sceneWidth / this.sceneHeight, 0.1, 3000);
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
        const sliderMode = this.props.sliderMode;
        // TODO: use Date.tolocaleDate("en_us", options) after UTC Timezone fix https://stackoverflow.com/a/50293232
        const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let timestamp;
        let isLoading = this.isLoading;

        if (sliderMode === 'pointInTime') {
            timestamp = <div className="date">{daysOfTheWeek[new Date(this.props.selectedPointInTimeTimestamp).getDay()]} {this.props.selectedPointInTimeTimestamp}</div>;
        } else if (sliderMode === 'timespan') {
            timestamp = <div className="date">{daysOfTheWeek[new Date(this.props.selectedPointInTimeTimestamp).getDay()]} {this.props.selectedTimespanTimestamp[0]} - {daysOfTheWeek[new Date(this.props.selectedPointInTimeTimestamp).getDay()]} {this.props.selectedTimespanTimestamp[1]}</div>;
        } else {
            timestamp = '';
        }

        return (
            <div className="cubes-visualization col-md-8">
                <header className="content-header">
                    <div className="param-info-container">
                        <span style={{ marginRight: "40px", marginLeft: "10px", fontWeight: "bold" }}>CPU-Auslastung:&nbsp;
                            <span style={{ fontWeight: "normal" }}>
                                {this.props.valueOfSlider}
                            </span>
                        </span>
                        <span style={{ fontWeight: "bold" }}>Mittelwert:&nbsp;</span>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCogs} style={{ textAlign: "right", marginRight: "10px"}} />
                        <FontAwesomeIcon icon={faExpand} style={{ textAlign: "right" }} />
                    </div>
                </header>
                <div className="content-container d-flex justify-content-center">
                    <LoadingOverlay
                        active={isLoading}
                        spinner={<BarLoader
                            color={"#f7b613"}
                            css={"background-color: #1b76ef"}
                        />}
                        text='Loading Data...'
                    >
                    <div id="cubes-visualisation" className="d-flex justify-content-start" ></div>
                    </LoadingOverlay>
                </div>
                <div id="timestamp-container">
                    <div>{timestamp}</div>
                </div>
                <div className="content-container">
                    {/* The 2D Navigation chart is rendered in the line below */}
                    {this.props.children}

                </div>
            </div>
        )
    };
    componentDidMount() {
        console.log("Component Did mount")
        this.initVis();

        // necessary for react-router
        if (this.props.dataSourceError === false) {
            this.setBarPlaceholders();
            this.createCubeData()
        }
        this.renderVis()
    }
    componentDidUpdate() {
        console.log("Component Did update")
        var t0 = performance.now();

        // console.log(this.renderer.info)

        if (this.props.dataSourceError === false) {
            this.setBarPlaceholders();
            this.createCubeData()
            this.isLoading = false;
        }
        this.renderVis();
        var t1 = performance.now();
        console.log("Der Aufruf von didUpdate dauerte " + (t1 - t0) + " Millisekunden.");

    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.frameId);
        const visFromDom = document.getElementById("cubes-visualisation");
        if (visFromDom) {
            visFromDom.removeChild(this.renderer.domElement);
        }
    };

    initVis() {

        this.scene.background = new THREE.Color(0xffffff);

        this.renderer.setSize(this.sceneWidth, this.sceneHeight);

        const visFromDom = document.getElementById("cubes-visualisation");
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
    createCubeData() {

        // removes bars of the last selected timestamp
        for (let index = 0; index < this.bars.length; index++) {
            this.scene.remove(this.bars[index]);
            this.bars[index].geometry.dispose();
            this.bars[index].geometry = null;
            this.bars[index].material.dispose();
            this.bars[index].material = null;
            // this.bars[index].dispose();
            this.bars[index] = null;
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

        this.props.data.datacenters.forEach((datacenter: Datacenter, key_dc: string) => {
            //set up view data

            let clusters = datacenter.clusters;
            clusters.forEach((value_cluster: Cluster, key_cluster: string) => {
                let instances = value_cluster.instances;

                instances.forEach((value_instance: Instance, key_instance: string) => {
                    var h = value_instance.utilization;



                    let gridKey: string = key_dc + "_" + key_cluster + "_" + key_instance;
                    let clusterKey = key_dc + "_" + key_cluster;

                    let gridValue: Array<number> = this.props.grid.get(gridKey);

                    var x = gridValue[0];
                    var z = gridValue[1];

                    this.createBar(x * 150, z * 150, this.scaleLog(h, this.props.maxH), h.toString(), this.props.clusterColors[clusterKey]);

                })
            })
        })
    };

    generateRandomColor(): string {
        return "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
    }

    createBar(x: number, z: number, h: number, textLabel: string, color: number) {

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
        this.bars.push(cube);

        geometry.dispose();
        material.dispose();
        geo.dispose();
        mat.dispose();
        this.renderer.renderLists.dispose();

    };

    createTextSprite(message) {
        var fontface = 'Helvetica';
        var fontsize = 80;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
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

    createBarPlaceholder(xPosition: number, zPosition: number) {
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

    setBarPlaceholders() {

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

    scaleLog = function (hvalue, hmax) {
        let maxh = Math.log(hmax);
        this.adjustfactor = (this.maxHeightOfbar / maxh).toFixed(4)

        //log zwischen +0.1 - +1 problem (negativ bzw 0)
        if (hvalue <= 1 && hvalue >= 0.1) {
            return (Math.log(2 - (1 - hvalue)) * this.adjustfactor) / 2
        }
        return Math.log(hvalue) * this.adjustfactor

    }

    createLight() {
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
        // interaction on hover
        this.changeColorOfHoveredCube(intersects);
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

    highlightCluster() {
        //let datacenter = this.props.data.datacenters[0];
        //let cluster = datacenter.clusters[0];
        //es gibt leider keine Referenz zwischen cluster und Bars        

        //Testen des Prinzips
        //var group = new THREE.Group();
        
        var geom = new THREE.Geometry();
                        
        var gset = [];
        for (let i = 0; i < 8; i++) {
            var b = this.bars[i];
            var boxGeom = new THREE.Geometry().fromBufferGeometry(b.geometry);
            geom.merge(boxGeom, b.matrix);
            gset.push(boxGeom);
        }
        //var merged = BufferGeometryUtils.mergeBufferGeometries(gset, true);
        //var mesh = new THREE.Mesh(merged, new THREE.MeshNormalMaterial());
        //mesh.geometry.computeBoundingBox();
        
        var bufGeometry = new THREE.BufferGeometry().fromGeometry(geom);
        bufGeometry.computeBoundingBox();
        var mesh2 = new THREE.Mesh( bufGeometry, new THREE.MeshNormalMaterial() );
        var bbox = bufGeometry.boundingBox.clone();

        var helper = new THREE.Box3Helper(bbox, new THREE.Color(0xff0000));
        this.scene.add(helper);
        console.log(mesh2);
        
        this.renderVis();
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

        try {
            this.highlightCluster();
        } catch(e) {
            console.log(e);
        }
    };

    // draw Scene
    renderVis() {
        // console.log("RENDER");
        this.renderer.render(this.scene, this.camera);
    };

    // run visualisation loop (update, render, repeat)
    loopVis = () => {
        this.renderVis();
        this.frameId = window.requestAnimationFrame(this.loopVis);
    };
}

export default CubesVisualisation;