import Model from './Model';
import Observer from './Observer';

export default class VisualRepresentation {
    static model;
    static observers;
    static config = require('./Config.json');

    /**
     * Initializes empty representation, with only basic observer data.
     * @param {number[]} observerIds The array of observer ids
     * @returns {VisualRepresentation}
    */
    static initialize() {
        VisualRepresentation.observers = Array(VisualRepresentation.config.setup.observing_angles.length)
    }

    /**
     * Loads the requested model along with all related data into the visual representation.
     * @param {string} modelName The file name of the model
     * @returns {void}
    */
    static loadModel(modelName) {
        VisualRepresentation.model = new Model(modelName);

        for (var observer in VisualRepresentation.observers) {
            observer.loadData(VisualRepresentation.model);
        }
    }

    static async getModels() {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/fileList.json`);
            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return await response.json();
        } catch (error) {
            return console.error("Error fetching file list:", error);
        }
    }

    static async getObservers(direction) {
        if (VisualRepresentation.model === null) { // TODO: Fuu brasko
            return [];
        }

        // const jsonFilename = VisualRepresentation.model.modeName + ".json";
        const jsonFilename = "bunny.json";

        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`);
            const data = await response.json(); 
            
            return data
                .filter((item) => item["condition"]["direction"] === direction)
                .map((item) => ({
                    value: item["observer id"],
                    label: item["observer id"],
                }));
        }
        catch (error) {
            console.error("Failed to load observer IDs:", error)
            return []
        }
        
        // const angleIndex = VisualRepresentation.config.setup.observing_angles.indexOf(angle);
    }

    static setObserver(angle, observerId) {
        const angleIndex = VisualRepresentation.config.setup.observing_angles.indexOf(angle);
        VisualRepresentation.observers[angleIndex] = new Observer(observerId);
        VisualRepresentation.observers[angleIndex].loadData();
    }
}
