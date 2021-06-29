import "./style.css";
import * as THREE from "three";

import { Controls } from "./controls-component";
import { ringsComponent } from "./rings-component";
import { loadingScreenComponent, pauseScreenComponent, HUD } from "./ui-component";
import { graphicsComponent } from "./graphics"
import { assetLoadingManager } from "./loading-manager"

let graphics, controls, manager, hud, rings;
let loadingScreen, pauseScreen;

let maxHealth = 100;
let maxSpeed = 150;
let maxAmmo = 10;

let health = maxHealth;
let speed = maxSpeed;
let ammo = maxAmmo;

const clock = new THREE.Clock();

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

let RESCOURCES_LOADED = false;

window.onload = init();

function init() {

    graphics = new graphicsComponent();

    loadingScreen = new loadingScreenComponent(graphics.colors);
    pauseScreen = new pauseScreenComponent();
    pauseScreen.init(clock);

    manager = new assetLoadingManager(models);

    THREE.DefaultLoadingManager.onLoad = function() {
        RESCOURCES_LOADED = true;

        // Render the scene for the first time
        graphics.composer.render();

        // Pause the game
        pauseScreen.pause(clock);

        // Load models and other crap
        manager.onRescourcesLoaded(graphics);

        hud.unhide();
    }

    window.addEventListener("resize", () => {
        graphics.onWindowResize();
        loadingScreen.onWindowResize();
    });

    // Controls
    controls = new Controls(graphics.camera, graphics.renderer.domElement, graphics.scene);

    controls.ammo = maxAmmo;
    controls.movementSpeed = 100;
    controls.domElement = graphics.renderer.domElement;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    // Rings
    rings = new ringsComponent(700, graphics.scene, graphics.USE_WIREFRAME, graphics.colors);
    rings.spawnRings();

    // HUD
    hud = new HUD(maxHealth, maxSpeed, maxAmmo);

    // Start the animation loop thingie
    tick();
}

function tick() {
    
    if(!RESCOURCES_LOADED) {
        requestAnimationFrame(tick);

        loadingScreen.animate(graphics.renderer);

        return;
    } else {
        loadingScreen.loadingText.style.display = "none";
    }

    requestAnimationFrame(tick);

    if(pauseScreen.isPaused()) return; // If the game is paused, it shouldn't be rendered.

    // graphics.renderer.render(graphics.scene, graphics.camera);
    graphics.composer.render();
    controls.update(clock.getDelta());
}