import VisualRepresentation from './VisualRepresentation';
import Sphere from './Sphere';
import * as THREE from "three";
// import Model from './Model';

const chroma = require('chroma-js');

export default class Observer {
    id;
    colorPallete;
    fixationsStatic;
    fixationsDynamic;
    sacades;
    vectors;
    observerSphere;


    /**
     * Initializes the obsever along with its color pallete.
     * @param {number} observerId The identifier of the observer.
     * @returns {Observer}
    */
    constructor(observerId, index) {
        const colors = Observer.generateRandomColorPalette();
        super(0,0,0, colors[0], VisualRepresentation.config.visualization.observer.size, true);

        this.id = observerId;
        this.colorPallete = colors;

        const degrees = (index - 3) * 15;
        const radians = degrees * (Math.PI / 180);

        // Create a rotation matrix for rotating around the Y axis
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(radians);

        // Apply the rotation to the camera position
        const rotatedPosition = VisualRepresentation.defaultCameraPos.clone().applyMatrix4(rotationMatrix);

        this.observerSphere = new Sphere(
            `direction-${index}`,
            rotatedPosition, 
            VisualRepresentation.colors[index] != null ? VisualRepresentation.colors[index] : "#ffffff",
            VisualRepresentation.config.visualization.observer.size,
            true
        );        

        this.loadData();
    }
    
    /**
     * Loads all related viewing data for the observer and selected model. Also displays the data as well as the observer itself in the scene.
     * @param {Model} model The model for which to load the data.
     * @returns {Observer}
    */
    async loadData(model) {
        this.fixationsStatic = [];
        this.fixationsDynamic = [];
        this.sacades = [];
        this.vectors = [];

        try {

            const data = await fetch(`${process.env.PUBLIC_URL}${VisualRepresentation.config.data_path_gaze}${VisualRepresentation.model.modelName}.json`);
            fetch(jsonFilePath)
            .then((response) => {
                if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const matchingObject = data.find(
                (item) =>
                    item["observer id"].toString() === observerId.toString()
                );
                if (matchingObject) {
                const orientation = matchingObject.condition.orientation;
                const offset = matchingObject.condition.offset;
                const matrix = new THREE.Matrix4();
                matrix.set(
                    orientation[0],
                    orientation[1],
                    orientation[2],
                    0,
                    orientation[3],
                    orientation[4],
                    orientation[5],
                    0,
                    orientation[6],
                    orientation[7],
                    orientation[8],
                    0,
                    0,
                    0,
                    0,
                    1
                );
    
                const fixations = matchingObject.fixations;
                addFixationSpheres(fixations, offset, matrix, index);
                } else {
                console.log(
                    "No matching object found for observer ID:",
                    observerId
                );
                }
            })
            .catch((error) => console.error("Error loading JSON file:", error));
        }
        catch (error) {
            return console.error("Error loading JSON file:", error);
        }
    }

    /**
     * Generates a 3 color gradient pallete to be used for the observer and its dynamic & static fixations.
     * @returns {string[]} An array of hex representations of the 3 colors.
    */
    static generateRandomColorPalette() {
        // Generate a random base color
        const baseColor = chroma.random();
    
        // Generate a palette of 3 colors with increasing lightness
        const palette = [
            baseColor.darken(2),    // Darker shade
            baseColor,              // Base color
            baseColor.brighten(2)   // Lighter shade
        ].map(color => color.hex());
    
        return palette;
    }

    addFixations(type) {
        (type === "static" ? this.fixationsStatic : this.fixationsDynamic).array.forEach(fixation => {
            fixation.add()
        });
    }

    removeFixations(type) {
        (type === "static" ? this.fixationsStatic : this.fixationsDynamic).array.forEach(fixation => {
            fixation.remove()
        });
    }

    remove() {
        this.observerSphere.remove();
        this.removeFixations("static");
        this.removeFixations("dynamic");
    }
}
