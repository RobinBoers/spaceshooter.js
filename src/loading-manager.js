import * as THREE from "three";

import { DDSLoader } from "./dds-loader";
import { MTLLoader } from "./mlt-loader";
import { OBJLoader } from "./obj-loader";

class assetLoadingManager {
    constructor(models) {

        if(!models) {
            console.warn("assetLoadingManager: 'models' parameter is requierd.")
        }

        this.models = models;
        this.meshes = {};

        this.load();

    }
    
    load() {
        let models = this.models;
        let mltLoader, objLoader;

        for (var _key in models) {
            (function(key){
                mltLoader = new MTLLoader();
                mltLoader.load(models[key].mtl, function(materials) {
    
                    materials.preload();
                    objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
    
                    objLoader.load(models[key].obj, function(mesh) {
                        mesh.traverse(function(node){
                            if(node instanceof THREE.Mesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                            }
                        });
                        models[key].mesh = mesh;
                    });
    
                });
            })(_key);
        }

        this.models = models;
    }

    getModel(key) {
        if(this.meshes[key]) return this.meshes[key];
    }

    onRescourcesLoaded(graphics) {
        console.log("Loaded rescources.");
        
        this.meshes["player"] = this.models.ship.mesh.clone();
        this.meshes["miner"] = this.models.miner.mesh.clone();
        this.meshes["miner2"] = this.models.miner.mesh.clone();
        this.meshes["enemie"] = this.models.ship.mesh.clone();
        
        this.meshes["player"].scale.x = 9;
        this.meshes["player"].scale.y = 9;
        this.meshes["player"].scale.z = 9;
        graphics.scene.add(this.meshes["player"]);

        this.meshes["miner"].scale.x = 200;
        this.meshes["miner"].scale.y = 200;
        this.meshes["miner"].scale.z = 200;
        this.meshes["miner"].position.set(300,600,-900);
        graphics.scene.add(this.meshes["miner"]);

        this.meshes["miner2"].scale.x = 200;
        this.meshes["miner2"].scale.y = 200;
        this.meshes["miner2"].scale.z = 200;
        this.meshes["miner2"].position.set(-20,60,-15);
        graphics.scene.add(this.meshes["miner2"]);
    
        graphics.renderer.render(graphics.scene, graphics.camera); // Render the first frame of the game to replace the loading screen
    }
}

export { assetLoadingManager }