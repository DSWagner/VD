import VisualElement from './VisualElement';
import VisualRepresentation from './VisualRepresentation';

const chroma = require('chroma-js');

export default class Observer extends VisualElement {
    id;
    colorPallete;
    fixationsStatic;
    fixationsDynamic;
    sacades;
    vectors;


    /**
     * Initializes the obsever along with its color pallete.
     * @param {number} observerId The identifier of the observer.
     * @returns {Observer}
    */
    constructor(observerId) {
        const colors = Observer.generateRandomColorPalette();
        super(0,0,0, colors[0], VisualRepresentation.config.visualization.observer.size, true);
        this.id = observerId;
        this.colorPallete = colors;
        this.display();
    }
    
    /**
     * Loads all related viewing data for the observer and selected model. Also displays the data as well as the observer itself in the scene.
     * @param {Model} model The model for which to load the data.
     * @returns {Observer}
    */
    loadData(model) {
        this.fixationsStatic = [];
        this.fixationsDynamic = [];
        this.sacades = [];
        this.vectors = [];
        this.display();
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
}
