import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DCState from '../model/DCState'


interface CubesVisProps {
    data: DCState
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
    frameId: number;

    constructor(props: CubesVisProps) {
        super(props);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 900 / 350, 0.1, 3000);
        // set initial camera position
        this.camera.position.set(1050, 516, 1397);
        this.mouse = new THREE.Vector2();
        this.INTERSECTED = null;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.raycaster = new THREE.Raycaster();

        // allows movement with mouseclicks 
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.bars = [];
        this.frameId = 0
    }
    render() {
        return (<div id="cubes-visualisation"></div>)
    };

    componentDidUpdate() {
        // props passed to the component are available in this lifecycle method
        console.log("Component Did Update Cubes Vis: ")
        console.log(this.props.data);
        this.initVis();
        this.loopVis();
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

        this.renderer.setSize(900, 350);

        const visFromDom = document.getElementById("cubes-visualisation");
        if (visFromDom) visFromDom.appendChild(this.renderer.domElement);

        // eventlistener for mouse movement. is needed for onHower and onClick logic
        document.addEventListener('mousemove', this.onHover, false);
        document.addEventListener('mouseup', this.onCubeclick, false);

        this.createLight();



        // creating the cubes, just for prototyping
        var countX = 50, countY = 50, spacingIncrement = 20, spacing = 0;

        for (let index = 0; index < countY; index++) {
            var randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
            this.createBar(countX, spacing, randomColor);
            spacing += spacingIncrement;
        }
        // this.createBar(count, 560, 0x61dafb);

    };

    createBar(total: number, z: number, color: string) {

        for (var i = 0; i < total; i += 1) {

            var geometry = new THREE.BoxGeometry(10, 10, 10);
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, z));


            var material = new THREE.MeshLambertMaterial({
                color: color
            });

            var cube = new THREE.Mesh(geometry, material);

            cube.position.x = i * 20;
            cube.name = "bar-" + i;
            cube.scale.y = Math.floor(Math.random() * 14) + 1;

            cube.castShadow = true;
            cube.receiveShadow = true;

            this.scene.add(cube);

            var geo = new THREE.EdgesGeometry(cube.geometry); // or WireframeGeometry
            var mat = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
            var wireframe = new THREE.LineSegments(geo, mat);
            cube.add(wireframe);

            this.bars.push(cube);
        }
    };

    createLight() {
        var ambient = new THREE.AmbientLight(0x999999);
        var spot = new THREE.SpotLight(0xffffff, 1);

        spot.position.set(0, 4000, 0);
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
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);

                this.INTERSECTED = intersects[0].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.setHex(0xff0000);
            }

        } else {
            if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
            this.INTERSECTED = null;
        }

    };
    // visualisation logic
    updateVis() {

    };

    // draw Scene
    renderVis() {
        // console.log(this.camera.position);
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