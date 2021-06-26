import "./style.css";

import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
// import { TextureLoader } from "three";

// Renderer, camera & scene stuff

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true,
});

let playing = false;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xdddddd, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.setZ(30);

window.addEventListener("resize", () => {
    onWindowResize();
});

// Skybox

// const loader = new THREE.CubeTextureLoader();
// const texture = loader.load(["assets/posx.jpg", "assets/negx.jpg", "assets/posy.jpg", "assets/negy.jpg", "assets/posz.jpg", "assets/negz.jpg"]);
// scene.background = texture;

// Lighting

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;

scene.add(ambientLight, directionalLight);

// Controls & Pause screen

const controls = new FlyControls(camera, renderer.domElement);

controls.movementSpeed = 100;
controls.domElement = renderer.domElement;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = false;

const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");

instructions.addEventListener("click", () => {
    playing = true;
    clock.start();
});

document.addEventListener("keydown", function (event) {
    if (event.key == "Escape") {
        playing = false;
        clock.stop();
    }
});

// Rings

function addRing() {
    const geometry = new THREE.TorusGeometry(15, 3, 16, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0xff6347 });
    const torus = new THREE.Mesh(geometry, material);

    const x = THREE.MathUtils.randFloat(-1000, 1000);
    const y = THREE.MathUtils.randFloat(-1000, 1000);
    const z = THREE.MathUtils.randFloat(-1000, 1000);

    torus.position.set(x, y, z);
    scene.add(torus);
}

for (var i = 0; i < 700; i++) {
    addRing();
}

// Main loop and helper functions

function animate() {
    requestAnimationFrame(animate);

    if (playing == true) {
        instructions.style.display = "none";
        blocker.style.display = "none";

        renderer.render(scene, camera);

        controls.update(clock.getDelta());
    } else {
        blocker.style.display = "block";
        instructions.style.display = "";
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.render(scene, camera);
animate();
