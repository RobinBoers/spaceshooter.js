import * as THREE from "three";

class loadingScreenComponent {
    constructor(colors) {
        if(!colors) colors = [ 0x000000, 0x000000, 0xff6347, 0x000000 ];

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
    }

    init(clock) {
        this.title.innerHTML = "Click to play";
        this.text.innerHTML = "Welcome to spaceshooter.js<br />This game is still WIP. If you find any bugs please report them at robin@geheimsite.nl<br />Also, have fun playing. There is no goal yet, but in the future there will be enemies trying to shoot you.<br />Press Escape to pause the game if you want to. Enjoy!";
        this.info.innerHTML = "<b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw, <b>left click</b> warp, <b>right click</b> shoot";

        this.instructions.addEventListener("click", () => {            
            this.resume(clock);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.pause(clock);
            }
        });

        // Hide pause screen on loadingscreen
        this.instructions.style.display = "none";
        this.blocker.style.display = "none";
        
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
        
        this.healthDisplay.style.width = (this.health / this.maxHealth) * 100;
        this.healthDisplay.style.width = (this.speed / this.maxSpeed) * 100;
        this.ammoDisplay.innerHTML = this.ammo + " / " + this.maxAmmo;
    }
}

export { loadingScreenComponent, pauseScreenComponent, HUD };
