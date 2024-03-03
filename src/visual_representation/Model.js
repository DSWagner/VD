export default class Model {
    modeName;
    fullPath;
    color;
    transparency;

    /**
     * Initializes this class with the desired model which is loaded from file.
     * @param {string} modelPath The full path to the model
     * @returns {void}
    */
    constructor(modelPath) {
        this.fullPath = modelPath;
        this.modeName = modelPath.split("/")[-1].split(".")[0];
    }
}
