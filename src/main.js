import "./style.css";
import * as THREE from "three";

import { DDSLoader } from "./dds-loader";
import { MTLLoader } from "./mlt-loader";
import { OBJLoader } from "./obj-loader";

import { FlyControls } from "./flycontrols-component";
import { spawnRings } from "./rings-component";
import { defaultLoadingScreen, defaultPauseScreen } from "./ui-component"

let camera, controls, scene, renderer, player;
let loadingScreen, pauseScreen;
let mltLoader, objLoader;

const clock = new THREE.Clock();

let colors = [ 0xdddddd, 0x000000, 0xff6347, 0xffffff ];
let models = {
    ship: {
        obj: "models/craft_speederD.obj", 
        mtl: "models/craft_speederD.mtl",
        mesh: null
    },
    miner: {
        obj: "models/craft_miner.obj", 
        mtl: "models/craft_miner.mtl",
        mesh: null
    }
};
let meshes = {};

let USE_WIREFRAME = false; //laggy, only for debugging
let RESCOURCES_LOADED = false;

window.onload = init();

function init() {
    // Camera and scene stuff
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);

    loadingScreen = new defaultLoadingScreen(colors);
    pauseScreen = new defaultPauseScreen(colors);
    pauseScreen.init(clock);

    THREE.DefaultLoadingManager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        RESCOURCES_LOADED = true;
        onRescourcesLoaded();
    }

    for (var _key in models) {
        (function(key){
            mltLoader = new MTLLoader();
            mltLoader.load(models[key].mtl, function(materials) {

                materials.preload();
                objLoader = new OBJLoader();
                objLoader.setMaterials(materials);

                objLoader.load(models[key].obj, function(mesh) {
                    mesh.traverse(function(node){
                        if(node instanceof THREE.Mesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;
                });

            });
        })(_key);
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors[1], 0.00000025);

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#bg"),
        antialias: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(colors[0], 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener("resize", () => {
        onWindowResize();
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(colors[3], 0.6);
    const directionalLight = new THREE.DirectionalLight(colors[3], 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;

    scene.add(ambientLight, directionalLight);

    if(USE_WIREFRAME) { //draw lighthelpers when wireframes are visible (for debugging purposes)
        const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(helper);
    }

    // Controls
    controls = new FlyControls(camera, renderer.domElement);

    controls.movementSpeed = 100;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    // Rings
    const rings = new spawnRings(700, scene, USE_WIREFRAME, colors);

    // Render the scene for the first time
    renderer.render(scene, camera);

    // Start the animation loop thingie
    animate();
}

function animate() {
    
    if(!RESCOURCES_LOADED) {
        requestAnimationFrame(animate);

        loadingScreen.update(renderer);

        return;
    } else {
        loadingScreen.loadingText.style.display = "none";
    }

    requestAnimationFrame(animate);

    if(pauseScreen.isPaused()) return; // If the game is paused, it shouldn't be rendered.

    renderer.render(scene, camera);
    controls.update(clock.getDelta());
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    loadingScreen.camera.aspect = window.innerWidth / window.innerHeight;
    loadingScreen.camera.updateProjectionMatrix();
}

function onRescourcesLoaded() {
    console.log("Loaded rescources.");
    
    meshes["player"] = Object.assign(models.ship.mesh);

    player = meshes["player"];
    player.scale.x = 9;
    player.scale.y = 9;
    player.scale.z = 9;
    scene.add(player);

    renderer.render(scene, camera); // Render the first frame of the game to replace the loading screen
}
