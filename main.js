import "./style.css";
import * as THREE from "three";

import { FlyControls } from "./flycontrols-component";
import { Ring } from "./rings-component";

let playing = false;

let camera, controls, scene, renderer;
const clock = new THREE.Clock();

let blocker, instructions, text;

window.onload = init();

function init() {
    // Camera and scene stuff
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);
    camera.position.setZ(30);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#bg"),
        antialias: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xdddddd, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener("resize", () => {
        onWindowResize();
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;

    scene.add(ambientLight, directionalLight);

    // Controls
    controls = new FlyControls(camera, renderer.domElement);

    controls.movementSpeed = 100;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    // Pause screen
    blocker = document.getElementById("blocker");
    instructions = document.getElementById("instructions");
    text = document.getElementById("text");

    text.innerHTML = "Welcome to spaceshooter.js<br />This game is still WIP. If you find any bugs please report them at robin@geheimsite.nl<br />Also, have fun playing. There is no goal yet, but in the future there will be enemies trying to shoot you.<br />Press Escape to pause the game if you want to. Enjoy!";

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

    for (var i = 0; i < 700; i++) {
        const ring = new Ring(scene);
    }

    // Render the scene for the first time
    renderer.render(scene, camera);

    // Start the animation loop thingie
    animate();
}

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
    renderer.render(scene, camera);
}
