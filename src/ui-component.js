import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
        this.info.innerHTML = "<b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw, <b>left click</b> warp, <b>right click</b> shoot, <b>T</b> reload";

        this.instructions.addEventListener("click", () => {            
            this.resume(clock);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.pause(clock);
            }
        });
        
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

    unhide() {
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

        this.GAME_STARTED = false;

        this.MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb";
        this.TEXTURE_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg"

        this.loader = new GLTFLoader();

        this.ambientLight = new THREE.AmbientLight(colors[3], 0.6);
        this.directionalLight = new THREE.DirectionalLight(colors[3], 0.6);

        this.lookAtCursor = true;
    }

    init() {

        const scope = this;
        let idle, neck, waist;

        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;

        this.scene.add(this.ambientLight, this.directionalLight);

        // Animated models, made with some help from: 
        // https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/
        scope.stacy_texture = new THREE.TextureLoader().load(scope.TEXTURE_PATH);
        scope.stacy_texture.flipY = false; // we flip the texture so that its the right way up

        scope.stacy_material = new THREE.MeshStandardMaterial({
            map: scope.stacy_texture
        });

        this.loader.load(
            scope.MODEL_PATH,
            function(gltf) {
                scope.model = gltf.scene;
                let fileAnimations = gltf.animations;

                scope.model.traverse(o => {
                    if (o.isMesh) {
                      o.castShadow = true;
                      o.receiveShadow = true;
                      o.material = scope.stacy_material;
                    }
                    if (o.isBone && o.name === 'mixamorigNeck') { 
                        neck = o;
                    }
                    if (o.isBone && o.name === 'mixamorigSpine') { 
                        waist = o;
                    }
                });

                scope.model.scale.set(9, 9, 9);
                scope.model.position.set(-13, -10, -13)
                scope.model.rotation.set(0, .9, 0)

                scope.scene.add(scope.model);

                scope.mixer = new THREE.AnimationMixer(scope.model);

                let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');

                idleAnim.tracks.splice(3, 3);
                idleAnim.tracks.splice(9, 3);

                idle = scope.mixer.clipAction(idleAnim);
                idle.play();
            },
            undefined, // not needed
            function(error) {
              console.error(error);
            }
        );

        if(scope.lookAtCursor) {
            document.addEventListener('mousemove', function(e) {
                var mousecoords = scope.getMousePos(e);
                if (neck && waist) {
                    scope.moveJoint(mousecoords, neck, 40);
                    scope.moveJoint(mousecoords, waist, 7);
                }
            });
        }        
    }

    getMousePos(e) {
        return { x: e.clientX, y: e.clientY };
    }

    moveJoint(mouse, joint, degreeLimit) {
        let degrees = this.getMouseDegrees(mouse.x, mouse.y, degreeLimit);
        joint.rotation.y = THREE.Math.degToRad(degrees.x);
        joint.rotation.x = THREE.Math.degToRad(degrees.y);
    }

    getMouseDegrees(x, y, degreeLimit) {
        let dx = 0,
            dy = 0,
            xdiff,
            xPercentage,
            ydiff,
            yPercentage;
      
        let w = { x: window.innerWidth, y: window.innerHeight };
      
        // Left (Rotates neck left between 0 and -degreeLimit)
        
         // 1. If cursor is in the left half of screen
        if (x <= w.x / 2) {
          // 2. Get the difference between middle of screen and cursor position
          xdiff = w.x / 2 - x;  
          // 3. Find the percentage of that difference (percentage toward edge of screen)
          xPercentage = (xdiff / (w.x / 2)) * 100;
          // 4. Convert that to a percentage of the maximum rotation we allow for the neck
          dx = ((degreeLimit * xPercentage) / 100) * -1; }
      // Right (Rotates neck right between 0 and degreeLimit)
        if (x >= w.x / 2) {
          xdiff = x - w.x / 2;
          xPercentage = (xdiff / (w.x / 2)) * 100;
          dx = (degreeLimit * xPercentage) / 100;
        }
        // Up (Rotates neck up between 0 and -degreeLimit)
        if (y <= w.y / 2) {
          ydiff = w.y / 2 - y;
          yPercentage = (ydiff / (w.y / 2)) * 100;
          // Note that I cut degreeLimit in half when she looks up
          dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
          }
        
        // Down (Rotates neck down between 0 and degreeLimit)
        if (y >= w.y / 2) {
          ydiff = y - w.y / 2;
          yPercentage = (ydiff / (w.y / 2)) * 100;
          dy = (degreeLimit * yPercentage) / 100;
        }
        return { x: dx, y: dy };
    }

    animate(renderer, clock) {

        if (this.mixer) {
            this.mixer.update(clock.getDelta());
        }
        
        renderer.render(this.scene, this.camera);
    }

    start(callback) {
        console.log("Menu hidden.");
        callback();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

}

export { loadingScreenComponent, pauseScreenComponent, menuScreenComponent, HUD };
