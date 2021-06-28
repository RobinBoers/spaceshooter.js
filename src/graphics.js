import * as THREE from "three";

class graphicsComponent {
    constructor() {
        this.colors = [ 0xdddddd, 0x000000, 0xff6347, 0xffffff ];

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("#bg"),
            antialias: true,
        });

        this.USE_WIREFRAME = false;

        this.ambientLight = new THREE.AmbientLight(this.colors[3], 0.6);
        this.directionalLight = new THREE.DirectionalLight(this.colors[3], 0.6);

        this.init();
    }

    init() {
        this.camera.position.setZ(30);
        
        this.scene.fog = new THREE.FogExp2(this.colors[1], 0.00000025);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(this.colors[0], 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;

        this.scene.add(this.ambientLight, this.directionalLight);

        if(this.USE_WIREFRAME) { // draw lighthelpers when wireframes are visible (for debugging purposes)
            scene.add(new THREE.DirectionalLightHelper(this.directionalLight, 5));
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.render(graphics.scene, graphics.camera);
    }
}

export { graphicsComponent }