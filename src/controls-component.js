import { EventDispatcher, Quaternion, Vector3 } from "three/build/three.module.js";
import * as THREE from "three";

const _changeEvent = { type: "change" };

class Controls extends EventDispatcher {
    constructor(object, domElement, scene) {
        super();

        if (domElement === undefined) {
            console.warn('flyControls: The second parameter "domElement" is now mandatory.');
            domElement = document;
        }

        this.object = object;
        this.domElement = domElement;

        // For shooting
        this.scene = scene;
        this.bullets = [];
        this.ammo = 10;

        // API

        this.movementSpeed = 1.0;
        this.rollSpeed = 0.005;

        this.dragToLook = false;
        this.autoForward = false;

        // disable default target object behavior

        // internals

        const scope = this;

        const EPS = 0.000001;

        const lastQuaternion = new Quaternion();
        const lastPosition = new Vector3();

        this.tmpQuaternion = new Quaternion();

        this.mouseStatus = 0;

        this.moveSpeedupper = 1;

        this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
        this.moveVector = new Vector3(0, 0, 0);
        this.rotationVector = new Vector3(0, 0, 0);

        this.keydown = function (event) {
            if (event.altKey) {
                return;
            }

            event.preventDefault();

            switch (event.code) {
                case "ControlLeft":
                    this.moveSpeedupper = 4.5;
                    break;
                case "ShiftLeft":
                    // this.movementSpeedMultiplier = 1;
                    this.moveState.down = 1;
                    break;
                case "Space": // spacebar
                    this.moveState.up = 1;
                    break;

                case "KeyW":
                    this.moveState.forward = 1;
                    break;
                case "KeyS":
                    this.moveState.back = 1;
                    break;

                case "KeyA":
                    this.moveState.left = 1;
                    break;
                case "KeyD":
                    this.moveState.right = 1;
                    break;

                case "KeyR":
                    this.moveState.up = 1;
                    break;
                case "KeyF":
                    this.moveState.down = 1;
                    break;

                case "ArrowUp":
                    this.moveState.pitchUp = 1;
                    break;
                case "ArrowDown":
                    this.moveState.pitchDown = 1;
                    break;

                case "ArrowLeft":
                    this.moveState.yawLeft = 1;
                    break;
                case "ArrowRight":
                    this.moveState.yawRight = 1;
                    break;

                case "KeyQ":
                    this.moveState.rollLeft = 1;
                    break;
                case "KeyE":
                    this.moveState.rollRight = 1;
                    break;
            }

            this.updateMovementVector();
            this.updateRotationVector();
        };

        this.keyup = function (event) {

            event.preventDefault();

            switch (event.code) {
                case "ShiftLeft":
                    // this.movementSpeedMultiplier = 1;
                    this.moveState.down = 0;
                    break;
                case "Space": // spacebar
                    this.moveState.up = 0;
                    break;
                case "KeyW":
                    this.moveState.forward = 0;
                    this.moveSpeedupper = 1;
                    break;
                case "KeyS":
                    this.moveState.back = 0;
                    break;

                case "KeyA":
                    this.moveState.left = 0;
                    break;
                case "KeyD":
                    this.moveState.right = 0;
                    break;

                case "KeyR":
                    this.moveState.up = 0;
                    break;
                case "KeyF":
                    this.moveState.down = 0;
                    break;

                case "ArrowUp":
                    this.moveState.pitchUp = 0;
                    break;
                case "ArrowDown":
                    this.moveState.pitchDown = 0;
                    break;

                case "ArrowLeft":
                    this.moveState.yawLeft = 0;
                    break;
                case "ArrowRight":
                    this.moveState.yawRight = 0;
                    break;

                case "KeyQ":
                    this.moveState.rollLeft = 0;
                    break;
                case "KeyE":
                    this.moveState.rollRight = 0;
                    break;
            }

            this.updateMovementVector();
            this.updateRotationVector();
        };

        this.mousedown = function (event) {
            if (this.domElement !== document) {
                this.domElement.focus();
            }

            event.preventDefault();

            if (this.dragToLook) {
                this.mouseStatus++;
            } else {
                switch (event.button) {
                    case 0:
                        this.moveSpeedupper = 4.5;
                        this.moveState.forward = 1;
                        break;
                    case 2:
                        // this.moveState.back = 1;
                        this.shoot();
                        break;
                }

                this.updateMovementVector();
            }
        };

        this.mousemove = function (event) {
            if (!this.dragToLook || this.mouseStatus > 0) {
                const container = this.getContainerDimensions();
                const halfWidth = container.size[0] / 2;
                const halfHeight = container.size[1] / 2;

                const accel = 5;

                this.moveState.yawLeft = -(event.pageX - container.offset[0] - halfWidth) / halfWidth *accel;
                this.moveState.pitchDown = (event.pageY - container.offset[1] - halfHeight) / halfHeight *accel;

                this.updateRotationVector();
            }
        };

        this.mouseup = function (event) {
            event.preventDefault();

            if (this.dragToLook) {
                this.mouseStatus--;

                this.moveState.yawLeft = this.moveState.pitchDown = 0;
            } else {
                switch (event.button) {
                    case 0:
                        this.moveSpeedupper = 1;
                        this.moveState.forward = 0;
                        break;
                    case 2:
                        this.moveState.back = 0;
                        break;
                }

                this.updateMovementVector();
            }

            this.updateRotationVector();
        };

        this.update = function (delta) {
            const moveMult = delta * scope.movementSpeed * scope.moveSpeedupper;
            const rotMult = delta * scope.rollSpeed;

            scope.object.translateX(scope.moveVector.x * moveMult);
            scope.object.translateY(scope.moveVector.y * moveMult);
            scope.object.translateZ(scope.moveVector.z * moveMult);

            scope.tmpQuaternion.set(scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1).normalize();
            scope.object.quaternion.multiply(scope.tmpQuaternion);

            if (lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
                scope.dispatchEvent(_changeEvent);
                lastQuaternion.copy(scope.object.quaternion);
                lastPosition.copy(scope.object.position);
            }

            // Update bullets

            let bullets = this.bullets;

            for(var index=0; index<bullets.length; index+=1){
                if( bullets[index] === undefined ) continue;
                if( bullets[index].alive == false ){
                    bullets.splice(index,1);
                    continue;
                }
                
                bullets[index].position.add(bullets[index].velocity);
            }

            this.bullets = bullets;
        };

        this.updateMovementVector = function () {
            const forward = this.moveState.forward || (this.autoForward && !this.moveState.back) ? 1 : 0;

            this.moveVector.x = -this.moveState.left + this.moveState.right;
            this.moveVector.y = -this.moveState.down + this.moveState.up;
            this.moveVector.z = -forward + this.moveState.back;

            //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
        };

        this.updateRotationVector = function () {
            this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
            this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft;
            this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;

            //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
        };

        this.getContainerDimensions = function () {
            if (this.domElement != document) {
                return {
                    size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
                    offset: [this.domElement.offsetLeft, this.domElement.offsetTop],
                };
            } else {
                return {
                    size: [window.innerWidth, window.innerHeight],
                    offset: [0, 0],
                };
            }
        };

        this.dispose = function () {
            this.domElement.removeEventListener("contextmenu", contextmenu);
            this.domElement.removeEventListener("mousedown", _mousedown);
            this.domElement.removeEventListener("mousemove", _mousemove);
            this.domElement.removeEventListener("mouseup", _mouseup);

            window.removeEventListener("keydown", _keydown);
            window.removeEventListener("keyup", _keyup);
        };

        this.shoot = function() {
                let bullet = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8), new THREE.MeshBasicMaterial({color: 0x000000}));
        
                if (this.ammo <= 0) return;
                this.ammo -= 1;
            
                const timeout = 4;
            
                bullet.position.set(
                    this.object.position.x, 
                    this.object.position.y, 
                    this.object.position.z
                );
        
                var vector = new THREE.Vector3();
                bullet.velocity = this.object.getWorldDirection(vector);
            
                bullet.alive = true;
                setTimeout(() => {
                    bullet.alive = false;
                    this.scene.remove(bullet);
                }, timeout*1000);
            
                this.scene.add(bullet);
                this.bullets.push(bullet);
        
                console.log("Shot fired.");
        }

        const _mousemove = this.mousemove.bind(this);
        const _mousedown = this.mousedown.bind(this);
        const _mouseup = this.mouseup.bind(this);
        const _keydown = this.keydown.bind(this);
        const _keyup = this.keyup.bind(this);

        this.domElement.addEventListener("contextmenu", contextmenu);

        this.domElement.addEventListener("mousemove", _mousemove);
        this.domElement.addEventListener("mousedown", _mousedown);
        this.domElement.addEventListener("mouseup", _mouseup);

        window.addEventListener("keydown", _keydown);
        window.addEventListener("keyup", _keyup);

        this.updateMovementVector();
        this.updateRotationVector();
    }
}

function contextmenu(event) {
    event.preventDefault();
}

export { Controls };