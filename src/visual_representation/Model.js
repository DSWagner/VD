import VisualRepresentation from "./VisualRepresentation";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export default class Model {
    modelName;
    fullPath;
    color;
    transparency;
    mesh;
    boundingBoxCenter;
    loadPromise;

    /**
     * Initializes this class with the desired model which is loaded from file.
     * @param {string} modelName The file name of the model
     * @returns {void}
    */
    constructor(modelName) {
        this.fullPath = VisualRepresentation.config.data_path_model + modelName;
        this.modelName = modelName.split(".")[0];

        this.loadPromise = new STLLoader().loadAsync(this.fullPath).then((geometry) => {
            geometry.computeBoundingBox();
            this.boundingBoxCenter = geometry.boundingBox.getCenter(
                new THREE.Vector3()
            );
            
            const material = new THREE.MeshNormalMaterial({
                transparent: true,
                opacity: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = "model";
            this.mesh = mesh;
            VisualRepresentation.scene.add(mesh);

            return this.boundingBoxCenter;
        });
    }
}
