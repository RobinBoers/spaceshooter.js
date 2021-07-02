import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class loadingScreenComponent {
    constructor(colors) {
        if(!colors) colors = [ 0xdddddd, 0x000000, 0xff6347, 0xffffff ];

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / innerHeight, 0.1, 100);
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(0.5,0.5,0.5),
            new THREE.MeshBasicMaterial({color: colors[2]})
        );

        this.loadingText = document.getElementById("loading-text");

        this.init();
    }

    init() {
        this.box.position.set(0,0,5);
        this.camera.lookAt(this.box.position);
        this.scene.add(this.box);
    }

    animate(renderer, speed) {

        if(!speed) speed = 1

        this.box.rotation.x += speed/100;
        this.box.rotation.y += speed/100;
        this.box.rotation.z += speed/100;

        renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

}

class pauseScreenComponent {
    constructor() {
        this.blocker = document.getElementById("blocker");
        this.instructions = document.getElementById("instructions");
        this.title = document.getElementById("title");
        this.text = document.getElementById("text");
        this.info = document.getElementById("info");

        this.PAUSED = true;

        // Hide pause screen on loadingscreen
        this.instructions.style.display = "none";
        this.blocker.style.display = "none";
    }

    init(clock) {
        this.title.innerHTML = "Click to play";
        this.text.innerHTML = "Welcome to spaceshooter.js<br />This game is still WIP. If you find any bugs please report them at robin@geheimsite.nl<br />Also, have fun playing. There is no goal yet, but in the future there will be enemies trying to shoot you.<br />Press Escape to pause the game if you want to. Enjoy!";
        this.info.innerHTML = "<b>WASD</b> move, <b>SPACE|SHIFT</b> up | down, <b>Q|E</b> roll, <b>UP|DOWN</b> pitch, <b>LEFT|TIGHT</b> yaw, <b>LEFT CLICK</b> warp, <b>RIGHT CLICK</b> shoot, <b>R</b> reload";

        this.instructions.addEventListener("click", () => {            
            this.resume(clock);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.pause(clock);
            }
        });

        this.resume(clock);
    }

    isPaused() {
        if(this.PAUSED == true) return true;
        else return false;
    }

    pause(clock) {
        this.PAUSED = true;
        clock.stop();

        this.instructions.style.display = "";
        this.blocker.style.display = "block";
    }

    resume(clock) {
        this.PAUSED = false;
        clock.start();

        this.instructions.style.display = "none";
        this.blocker.style.display = "none";
    }
}

class HUD {
    constructor(maxHealth, maxSpeed, maxAmmo) {
        
        this.element = document.getElementById("hud");
        this.healthDisplay = document.getElementById("health-display");
        this.speedDisplay = document.getElementById("speed-display");
        this.ammoDisplay = document.getElementById("ammo-display");

        this.maxHealth = maxHealth;
        this.maxSpeed = maxSpeed;
        this.maxAmmo = maxAmmo;

        this.init();
    }

    updateStats(maxHealth, maxSpeed, maxAmmo) {
        this.maxHealth = maxHealth;
        this.maxSpeed = maxSpeed;
        this.maxAmmo = maxAmmo;

        this.init();
    }

    init() {
        this.health = this.maxHealth;
        this.speed = this.maxSpeed;
        this.ammo = this.maxAmmo;
        
        this.hide();
        this.update(this.health, this.speed, this.ammo);
    }

    hide() {
        this.element.style.display = "none";
    }

    show() {
        this.element.style.display = "";
    }

    update(health, speed, ammo) {
        this.health = health;
        this.speed = speed;
        this.ammo = ammo;
        
        this.healthDisplay.style.width = (this.health / this.maxHealth) * 100 + "%";
        this.speedDisplay.style.width = (this.speed / this.maxSpeed) * 100 + "%";
        this.ammoDisplay.innerHTML = this.ammo + " / " + this.maxAmmo;
    }
}

class menuScreenComponent {
    constructor(colors) {

        if(!colors) colors = [ 0xdddddd, 0x000000, 0xff6347, 0xffffff ];

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / innerHeight, 0.1, 100);
        this.camera.position.setZ(30);

        this.GAME_STARTED = false;

        this.MODEL_PATH = "./models/characterMedium.fbx";
        this.TEXTURE_PATH = "./skins/cyborgFemaleA.png";
        this.ANIMATION_PATH = "./anims/idle.fbx";

        this.skins = [];
        this.textures = ["./skins/cyborgFemaleA.png", "./skins/criminalMaleA.png", "./skins/skaterFemaleA.png", "./skins/skaterMaleA.png"];
        this.names = ["Lila", "Juan", "Egg", "Robby"];
        this.stats = [
            {
                hp: 100,
                warp: 250,
                speed: 100,
                ammo: 30
            },
            {
                hp: 160,
                warp: 120,
                speed: 90,
                ammo: 50
            },
            {
                hp: 95,
                warp: 160,
                speed: 130,
                ammo: 21
            },
            {
                hp: 105,
                warp: 150,
                speed: 180,
                ammo: 25
            },
        ]

        this.loader = new FBXLoader();

        this.ambientLight = new THREE.AmbientLight(colors[3], 0.6);
        this.directionalLight = new THREE.DirectionalLight(colors[3], 0.6);

        this.animationActions = [];
        this.activeAction;

        this.element = document.getElementById("menu");
        this.title = document.getElementById("menu-title");
        this.text = document.getElementById("menu-text");
        this.logo = document.getElementById("logo");
        this.button = document.getElementById("play-btn");

        this.statsElement = document.getElementById("menu-stats");
        this.playerName = document.getElementById("player-name");
        this.playerHealth = document.getElementById("player-hp");
        this.playerWarp = document.getElementById("player-warp");
        this.playerSpeed = document.getElementById("player-speed");
        this.playerAmmo = document.getElementById("player-ammo");

        this.nextButton = document.getElementById("player-next");
        this.prevButton = document.getElementById("player-prev");

        this.currentSkin;

        this.init();
        this.hide();
    }

    init() {

        const scope = this;

        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;

        this.scene.add(this.ambientLight, this.directionalLight);

        // Animated models

        for(var i=0;i<this.textures.length;i++) {
            let texture = new THREE.TextureLoader().load(this.textures[i]);
            scope.skins.push(new THREE.MeshStandardMaterial({
                map: texture
            }));
        }

        this.loader.load(
            scope.MODEL_PATH,
            function(object) {
                scope.model = object;

                scope.model.traverse(o => {
                    if (o.isMesh) {
                      o.castShadow = true;
                      o.receiveShadow = true;
                    }
                });

                scope.model.scale.set(.1,.1,.1);
                scope.model.position.set(-15, -30, 0);
                scope.model.rotation.set(0, .7, 0);

                scope.mixer = new THREE.AnimationMixer(scope.model);

                scope.loader.load(
                    scope.ANIMATION_PATH,
                    function(object) {
        
                        let animationAction = scope.mixer.clipAction(object.animations[0]);
                        scope.animationActions.push(animationAction);
                        scope.activeAction = scope.animationActions[0];
                        scope.activeAction.play();
        
                    },
                    undefined, // not needed
                    function(error) {
                      console.error(error);
                    }
                );

            },
            undefined, // not needed
            function(error) {
              console.error(error);
            }
        );   

        scope.nextButton.onclick = function() {
            scope.selectSkin(true);
        }
        scope.prevButton.onclick = function() {
            scope.selectSkin(false);
        }

    }

    switchSkin(num) {

        const scope = this;

        scope.model.traverse(o => {
            if (o.isMesh) {
              o.material = scope.skins[num];
            }
        });

        this.health = this.stats[num].hp;
        this.warp = this.stats[num].warp;
        this.speed = this.stats[num].speed;
        this.ammo = this.stats[num].ammo;

        this.playerName.innerHTML = scope.names[num];
        this.playerHealth.innerHTML = "<b>Health:</b> "+this.health;
        this.playerWarp.innerHTML = "<b>Warp time:</b> "+this.warp;
        this.playerSpeed.innerHTML = "<b>Speed:</b> "+this.speed;
        this.playerAmmo.innerHTML = "<b>Ammo:</b> "+this.ammo;

        this.currentSkin = num;

    }

    selectSkin(next) {
        if(next == true) {
            if(this.currentSkin < this.skins.length - 1) {
                this.switchSkin(this.currentSkin + 1);
            } else {
                this.switchSkin(0);
            }
        } else {
            if(this.currentSkin > 0) {
                this.switchSkin(this.currentSkin - 1);
            } else {
                this.switchSkin(this.skins.length - 1);
            }
        }
    }

    show() {
        this.scene.add(this.model);
        this.element.style.display = "";
        this.statsElement.style.display = "";

        this.title.innerHTML = "spaceshooter.js";
        this.logo.setAttribute("src", "./logo.png");
        this.text.innerHTML = "Welcome to spaceshooter.js<br />This game is still WIP. If you find any bugs please report them at robin@geheimsite.nl<br />Also, have fun playing. There is no goal yet, but in the future there will be enemies trying to shoot you.<br />Press Escape to pause the game if you want to. Now please select your pilot and click Play to start your adventure. Enjoy!";
        this.button.innerHTML = "Play!";

        this.prevButton.innerHTML = " &#8678; Previous ";
        this.nextButton.innerHTML = " Next &#8680; ";

        this.switchSkin(1);
    }

    hide() {
        this.element.style.display = "none";
        this.statsElement.style.display = "none";
    }

    animate(renderer, clock) {

        if (this.mixer) {
            this.mixer.update(clock.getDelta());
        }
        
        renderer.render(this.scene, this.camera);
    }

    exit(callback) {
        console.log("Menu hidden, game started.");

        this.hide();

        this.scene.clear();
        this.GAME_STARTED = true;
        callback();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

}

export { loadingScreenComponent, pauseScreenComponent, menuScreenComponent, HUD };
