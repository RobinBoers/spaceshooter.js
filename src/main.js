import "./style.css";
import * as THREE from "three";

import { Controls } from "./controls-component";
import { ringsComponent } from "./rings-component";
import { loadingScreenComponent, pauseScreenComponent, menuScreenComponent, HUD } from "./ui-component";
import { graphicsComponent } from "./graphics"
import { assetLoadingManager } from "./loading-manager"

let graphics, controls, manager, hud, rings;
let loadingScreen, pauseScreen, menuScreen;

let maxHealth = 100;
let maxWarp = 150;
let maxSpeed = 100;
let maxAmmo = 30;

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

    menuScreen = new menuScreenComponent(graphics.scene, graphics.colors);

    manager = new assetLoadingManager(models);

    THREE.DefaultLoadingManager.onLoad = function() {
        RESCOURCES_LOADED = true;

        // Load models and other crap
        manager.onRescourcesLoaded(graphics);

        // Render the scene for the first time
        graphics.composer.render();

        // Show menu
        menuScreen.show();
    }

    menuScreen.button.onclick = function() {
        menuScreen.exit(() => {
            // Pause the game
            pauseScreen.init(clock);

            maxHealth = menuScreen.health;
            maxWarp = menuScreen.warp;
            maxSpeed = menuScreen.speed;
            maxAmmo = menuScreen.ammo;

            // HUD
            hud.updateStats(maxHealth, maxWarp, maxAmmo)
            hud.show();

            // Controls
            controls = new Controls(graphics.camera, graphics.renderer.domElement, graphics.scene);

            controls.maxAmmo = maxAmmo;
            controls.ammo = maxAmmo;

            controls.movementSpeed = maxSpeed;
            controls.domElement = graphics.renderer.domElement;
            controls.rollSpeed = Math.PI / 24;
            controls.autoForward = false;
            controls.dragToLook = false;

            controls.maxSpeedTime = maxWarp;
            controls.speedTimeLeft = maxWarp;

            controls.godMode = false;
        });
    };

    window.addEventListener("resize", () => {
        graphics.onWindowResize();
        loadingScreen.onWindowResize();
        menuScreen.onWindowResize();
    });

    // Rings
    rings = new ringsComponent(50, graphics.scene, graphics.USE_WIREFRAME, graphics.colors);
    rings.spawnRings();

    // HUD
    hud = new HUD(maxHealth, maxWarp, maxAmmo);

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

    // When the player is still in the hub / menu thinhie, dont render/update the game.
    if(!menuScreen.GAME_STARTED) {
        menuScreen.animate(graphics.renderer, clock);
        return;
    }

    if(pauseScreen.isPaused()) return; // If the game is paused, it shouldn't be rendered.

    // graphics.renderer.render(graphics.scene, graphics.camera);
    hud.update(100, controls.speedTimeLeft, controls.ammo)
    graphics.composer.render();
    controls.update(clock.getDelta());
}