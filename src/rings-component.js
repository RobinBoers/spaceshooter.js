import * as THREE from "three";

class Ring {
    constructor(scene, USE_WIREFRAME, color) {
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

export { Ring };
