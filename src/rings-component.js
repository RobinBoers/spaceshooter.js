import * as THREE from "three";

class spawnRings {
    constructor(count, scene, USE_WIREFRAME, colors) {

        // Required options
        if(!count) console.log("Count is requierd!");
        if(!scene) console.log("Scene is requierd!");

        // Optional options
        if(!USE_WIREFRAME) USE_WIREFRAME = false;
        if(!colors) colors = [ 0x000000, 0x000000, 0xff6347, 0x000000 ];

        this.count = count;
        this.scene = scene;
        this.USE_WIREFRAME = USE_WIREFRAME;
        this.colors = colors;

        this.init();
        
    }

    init() {
        for (var i = 0; i < this.count; i++) {
            this.addRing(this.scene, this.USE_WIREFRAME, this.colors[2]);
        }
    }

    addRing(scene, USE_WIREFRAME, color) {
        const geometry = new THREE.TorusGeometry(15, 3, 16, 100);
        const material = new THREE.MeshLambertMaterial({ color: color, wireframe: USE_WIREFRAME });
        const torus = new THREE.Mesh(geometry, material);

        const x = THREE.MathUtils.randFloat(-1000, 1000);
        const y = THREE.MathUtils.randFloat(-1000, 1000);
        const z = THREE.MathUtils.randFloat(-1000, 1000);

        torus.position.set(x, y, z);
        scene.add(torus);
    }
    
}

export { spawnRings };
