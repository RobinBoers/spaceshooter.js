import "./style.css";
import * as THREE from "three";
//import { Ammo } from "./libs/ammo";

import { Controls } from "./controls-component";
import { ringsComponent } from "./rings-component";
import { Enemies } from "./enemies-ai";
import { loadingScreenComponent, pauseScreenComponent, menuScreenComponent, HUD } from "./ui-component";
import { graphicsComponent } from "./graphics";
import { assetLoadingManager } from "./loading-manager";

let graphics, controls, manager, hud, rings, enemies;
let loadingScreen, pauseScreen, menuScreen;

let physicsWorld;

// Defaults, will change later depending
// on which pilot the player chooses.
let maxHealth = 100;
let maxWarp = 150;
let maxSpeed = 100;
let maxAmmo = 30;

const clock = new THREE.Clock();

// In-game models. The models used on the menu are loaded
// seperatly in their own class.
let models = {
    ship: {
        obj: "models/craft_speederD.obj",
        mtl: "models/craft_speederD.mtl",
        mesh: null,
    },
    miner: {
        obj: "models/craft_miner.obj",
        mtl: "models/craft_miner.mtl",
        mesh: null,
    },
};

let RESCOURCES_LOADED = false;

// Ammo().then(function (AmmoLib) {
//     init();
//     initPhysics();
// });

// console.log(Ammo);

window.onload = init();

function init() {
    graphics = new graphicsComponent();

    loadingScreen = new loadingScreenComponent(graphics.colors);
    pauseScreen = new pauseScreenComponent();

    menuScreen = new menuScreenComponent(graphics.colors);

    manager = new assetLoadingManager(models);

    THREE.DefaultLoadingManager.onLoad = function () {
        RESCOURCES_LOADED = true;

        // Load models and other crap
        manager.onRescourcesLoaded(graphics);

        // Show menu
        menuScreen.show();
    };

    menuScreen.button.onclick = function () {
        menuScreen.exit(() => {
            // Initiaze the pausescreen
            pauseScreen.init(clock);

            // Hide cursor and lock it
            document.querySelector("#bg").style.cursor = "none";

            // Make crosshair visible
            document.querySelector("#crosshair-wrapper").style.display = "flex";
            document.querySelector("#crosshair").setAttribute("src", "assets/crosshair.png");

            // Spawn enemies (with default stats)
            enemies = new Enemies(50, graphics.scene, maxHealth, maxSpeed, manager.getModel("enemie"), 9);
            enemies.spawn();

            maxHealth = menuScreen.health;
            maxWarp = menuScreen.warp;
            maxSpeed = menuScreen.speed;
            maxAmmo = menuScreen.ammo;

            // Set correct stats for the HUD (based on the
            //pilot chosen by the player)
            hud.updateStats(maxHealth, maxWarp, maxAmmo);
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

            controls.godMode = false; // For testing only
        });
    };

    window.addEventListener("resize", () => {
        graphics.onWindowResize();
        loadingScreen.onWindowResize();
        menuScreen.onWindowResize();
    });

    // Rings (for debugging)
    // rings = new ringsComponent(50, graphics.scene, graphics.USE_WIREFRAME, graphics.colors);
    // rings.spawn();

    // HUD
    // The values provided here will change later,
    // depending on what pilot the player chooses
    hud = new HUD(maxHealth, maxWarp, maxAmmo);

    // Start the animation loop thingie
    tick();
}

// function initPhysics() {
//     let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
//         dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
//         overlappingPairCache = new Ammo.btDbvtBroadphase(),
//         solver = new Ammo.btSequentialImpulseConstraintSolver();

//     physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
//     physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
// }

function tick() {
    // If the game isnt fully loaded yet, show the loading screen
    if (!RESCOURCES_LOADED) {
        requestAnimationFrame(tick);

        loadingScreen.animate(graphics.renderer);
        return;
    } else {
        // If it is loaded, hide the loading text
        loadingScreen.loadingText.style.display = "none";
    }

    requestAnimationFrame(tick);

    // When the player is still in the menu,
    // render the menu and not the game
    if (!menuScreen.GAME_STARTED) {
        menuScreen.animate(graphics.renderer, clock);
        return;
    }

    if (pauseScreen.isPaused()) return; // If the game is paused, it shouldn't be rendered.

    // graphics.renderer.render(graphics.scene, graphics.camera);
    hud.update(maxHealth, controls.speedTimeLeft, controls.ammo);
    enemies.update();
    graphics.composer.render();
    controls.update(clock.getDelta());
}
