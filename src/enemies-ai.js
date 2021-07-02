import * as THREE from "three";

class Enemies {
    constructor(count, scene, hp, speed, model, scale) {

        // Required parameters
        if(!count) {console.warn("Enemies: 'count' parameter is requierd."); return;}
        if(!scene) {console.warn("Enemies: 'scene' parameter is requierd."); return;}
        if(!hp) {console.warn("Enemies: 'hp' parameter is requierd."); return;}
        if(!speed) {console.warn("Enemies: 'speed' parameter is requierd."); return;}
        if(!model) {console.warn("Enemies: 'model' parameter is requierd."); return;}
        if(!scale) {console.warn("Enemies: 'scale' parameter is requierd."); return;}

        this.count = count;
        this.scene = scene;
        this.health = hp;
        this.speed = speed;
        this.model = model;
        this.scale = scale;
        
    }

    spawn() {
        for (var i = 0; i < this.count; i++) {
            this.add(this.scene, this.model);
        }
    }

    add(scene, model, scale) {
        const enemie = model.clone();

        const xPos = THREE.MathUtils.randFloat(-1000, 1000);
        const yPos = THREE.MathUtils.randFloat(-1000, 1000);
        const zPos = THREE.MathUtils.randFloat(-1000, 1000);

        const xRot = THREE.MathUtils.randFloat(-1, 1);
        const yRot = THREE.MathUtils.randFloat(-1, 1);
        const zRot = THREE.MathUtils.randFloat(-1, 1);

        enemie.scale.set(9, 9, 9);
        enemie.position.set(xPos, yPos, zPos);
        enemie.rotation.set(xRot, yRot, zRot);
        scene.add(enemie);
    }

    update() {

    }
    
}

export { Enemies };
