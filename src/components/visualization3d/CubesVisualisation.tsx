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
    dataSourceSuccess: boolean
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
    frameId: number;


    sceneWidth = 900;
    sceneHeight = 500;

    maxHeightOfbar = 800;

    constructor(props: CubesVisProps) {
        super(props);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.sceneWidth / this.sceneHeight, 0.1, 3000);
        // set initial camera position
        this.camera.position.set(500, 1000, 1500);

        this.mouse = new THREE.Vector2();
        this.INTERSECTED = null;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.raycaster = new THREE.Raycaster();

        // allows movement with mouseclicks 
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.bars = [];
        this.textSprites = []
        this.frameId = 0

    }
    render() {
        const sliderMode = this.props.sliderMode;
        let slider, timestamp;

        if (sliderMode === 'pointInTime') {
            slider = <PointInTimeSlider max={this.props.maxRangeSlider} valueOfSlider={[this.props.valueOfSlider]} onChange={this.props.accessChild} />;
            timestamp = <h2>{this.props.selectedPointInTimeTimestamp}</h2>;
        } else if (sliderMode === 'timespan') {
            slider = <TimeSpanSlider max={this.props.maxRangeSlider} timespanValuesOfSlider={this.props.timespanValuesOfSlider} onChange={this.props.accessChild} />;
            timestamp = <h2>{this.props.selectedTimespanTimestamp[0]} - {this.props.selectedTimespanTimestamp[1]}</h2>;     
        } else {
            slider = '';
            timestamp = '';
        }

        return (
            <Container>
                <div id="cubes-visualisation"></div>
                <div className="slidercontainer">
                    {slider}
                    {timestamp}
                </div>             
            </Container>
        )
    };

    componentDidUpdate() {
        // props passed to the component are available in this lifecycle method
        if (this.props.dataSourceSuccess === true) {
            this.setBarPlaceholders();
            this.createCubeData()
        }
    }

    componentDidMount() {
        this.initVis();
        this.loopVis();

        // necessary for react-router
        if (this.props.dataSourceSuccess === true) {
            this.setBarPlaceholders();
            this.createCubeData()
        }
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
        }

        // removes text sprites of the last selected timestamp
        for (let index = 0; index < this.textSprites.length; index++) {
            this.scene.remove(this.textSprites[index]);
        }

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
        var geometry = new THREE.BoxGeometry(40, h, 40);
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
        return sprite;
    }

    createBarPlaceholder(xPosition: number, zPosition: number) {
        var geometry = new THREE.PlaneGeometry(40, 40);
        var material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);

        var geo = new THREE.EdgesGeometry(plane.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 1 });
        var wireframe = new THREE.LineSegments(geo, mat);
        plane.rotation.x = Math.PI / 2;
        plane.position.x = xPosition;
        plane.position.z = zPosition;
        plane.add(wireframe);

        this.scene.add(plane);
    }

    setBarPlaceholders() {
        var index = 0;

        this.props.grid.forEach((element) => {
            // this condition is only necessary beacuse there is a bug in SolrAdapter.ts 
            // the last element of the grid is undifined, without this condition one to many playeholder would be falsely rendered
            if (index < this.props.grid.size - 1) {
                this.createBarPlaceholder(element[0] * 150, element[1] * 150);
            }
            index++
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

    randomnizeBarHeights() {
        for (let index = 0; index < this.bars.length; index++) {
            this.bars[index].scale.y = Math.floor(Math.random() * 20) + 1;
        }
    };

    onHover = (event: any) => {
        // calculate mouse position in normalized device coordinates acordign to scene width and height
        // (-1 to +1) for both components
        this.mouse.x = ((event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.height) * 2 + 1;

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // calculate objects intersecting the picking ray
        var intersects = this.raycaster.intersectObjects(this.scene.children);

        // interaction on hover
        this.changeColorOfHoveredCube(intersects);
    };
    onCubeclick = (event: any) => {
        // check if middle mouse button was clicked
        if (event.which === 2) {
            // TODO: Double code, needs refactoring, see onHover Function 
            this.mouse.x = ((event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.width) * 2 - 1;
            this.mouse.y = -((event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.height) * 2 + 1;

            // update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // calculate objects intersecting the picking ray
            var intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0) {
                alert(intersects[0].object.name);
            }
        }
    }


    changeColorOfHoveredCube(intersects: THREE.Intersection[]) {
        if (intersects.length > 0) {
            if (this.INTERSECTED !== intersects[0].object) {
                if (this.INTERSECTED && this.INTERSECTED.type === "Mesh") this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);

                this.INTERSECTED = intersects[0].object;
                if (this.INTERSECTED.type === "Mesh") {
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                    this.INTERSECTED.material.emissive.setHex(0xff0000);
                }
            }
        } else {
            if (this.INTERSECTED && this.INTERSECTED.type === "Mesh") this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
            this.INTERSECTED = null;
        }

    };

    // visualisation logic
    updateVis() {

    };

    // draw Scene
    renderVis() {
        this.renderer.render(this.scene, this.camera);
    };

    // run visualisation loop (update, render, repeat)
    loopVis = () => {
        this.updateVis();
        this.renderVis();
        this.frameId = window.requestAnimationFrame(this.loopVis);
    };
}

export default CubesVisualisation;