import Model from './Model';
import Observer from './Observer';

export default class VisualRepresentation {
    model;
    observers;
    static config = require('./Config.json');

    /**
     * Initializes empty representation, with only basic observer data.
     * @param {number[]} observerIds The array of observer ids
     * @returns {VisualRepresentation}
    */
    constructor(observerIds) {
        this.observers = observerIds.map(id => new Observer(id));
    }
    
    /**
     * Loads the requested model along with all related data into the visual representation.
     * @param {string} modelName The file name of the model
     * @returns {void}
    */
    loadModel(modelName) {
        this.model = new Model(modelName);

        for (var observer in this.observers) {
            observer.loadData(this.model);
        }
    }
}
