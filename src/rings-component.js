import * as THREE from "three";

class ringsComponent {
    constructor(count, scene, USE_WIREFRAME, colors) {

        // Required parameters
        if(!count) {console.warn("ringsComponent: 'count' parameter is requierd."); return;}
        if(!scene) {console.warn("ringsComponent: 'scene' parameter is requierd."); return;}

        // Optional parameters
        if(!USE_WIREFRAME) USE_WIREFRAME = false;
        if(!colors) colors = [ 0xdddddd, 0x000000, 0xff6347, 0xffffff ];

        this.count = count;
        this.scene = scene;
        this.USE_WIREFRAME = USE_WIREFRAME;
        this.colors = colors;
        
    }

    spawn() {
        for (var i = 0; i < this.count; i++) {
            this.add(this.scene, this.USE_WIREFRAME, this.colors[2]);
        }
    }

    add(scene, USE_WIREFRAME, color) {
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

export { ringsComponent };
