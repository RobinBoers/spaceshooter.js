import "./style.css";
import * as THREE from "three";

import { DDSLoader } from "./dds-loader";
import { MTLLoader } from "./mlt-loader";
import { OBJLoader } from "./obj-loader";

import { FlyControls } from "./flycontrols-component";
import { Ring } from "./rings-component";

let camera, controls, scene, renderer, mltLoader, objLoader, player, loadingScreen;
let blocker, instructions, text, loadingText;

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

let PAUSED = true;
let USE_WIREFRAME = false; //laggy, only for debugging
let RESCOURCES_LOADED = false;

window.onload = init();

function init() {
    // Camera and scene stuff
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);
    camera.position.setZ(30);

    loadingScreen = loadingScreen = {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(90, window.innerWidth / innerHeight, 0.1, 100),
        box: new THREE.Mesh(
            new THREE.BoxGeometry(0.5,0.5,0.5),
            new THREE.MeshBasicMaterial({color: colors[2]})
        )
    }

    loadingScreen.box.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    THREE.DefaultLoadingManager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        RESCOURCES_LOADED = true;
        onRescourcesLoaded();
    }

    // mltLoader = new MTLLoader();
    // mltLoader.load("models/craft_speederD.mtl", function(materials) {
    //     materials.preload();
    //     objLoader = new OBJLoader();
    //     objLoader.setMaterials(materials);


    //     objLoader.load("models/craft_speederD.obj", function(mesh) {
    //         player = mesh;
    //         player.scale.x = 9;
    //         player.scale.y = 9;
    //         player.scale.z = 9;
    //         scene.add(player)
    //     })
    // })

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

    // Pause screen and loading screen
    blocker = document.getElementById("blocker");
    instructions = document.getElementById("instructions");

    text = document.getElementById("text");
    info = document.getElementById("info");
    title = document.getElementById("title");

    loadingText = document.getElementById("loading-text");

    text.innerHTML = "Welcome to spaceshooter.js<br />This game is still WIP. If you find any bugs please report them at robin@geheimsite.nl<br />Also, have fun playing. There is no goal yet, but in the future there will be enemies trying to shoot you.<br />Press Escape to pause the game if you want to. Enjoy!";

    info.innerHTML = "<b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw";

    title.innerHTML = "Click to play"

    instructions.addEventListener("click", () => {
        PAUSED = false;
        clock.start();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key == "Escape") {
            PAUSED = true;
            clock.stop();
        }
    });

    for (var i = 0; i < 700; i++) {
        const ring = new Ring(scene, USE_WIREFRAME, colors[2]);
    }

    // Render the scene for the first time
    renderer.render(scene, camera);

    // Start the animation loop thingie
    animate();
}

function animate() {
    
    if(!RESCOURCES_LOADED) {
        requestAnimationFrame(animate);

        instructions.style.display = "none";
        blocker.style.display = "none";

        loadingScreen.box.rotation.x += 0.01;
        loadingScreen.box.rotation.y += 0.01;
        loadingScreen.box.rotation.z += 0.01;

        renderer.render(loadingScreen.scene, loadingScreen.camera);

        return;
    } else {
        loadingText.style.display = "none";
    }

    requestAnimationFrame(animate);

    if (!PAUSED) {
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
