import VisualRepresentation from './VisualRepresentation';

export default class VisualElement {
    position;
    color;
    size;
    visible;
    reference;

    /**
     * Initializes the "abstract" visual element.
     * @param {string} name A name of the obejct.
     * @param {THREE.Vector3} position The Xposition of the object.
     * @param {string} color A hex representation of the desired color.
     * @param {number} size The size of the element (interpreted as radius for spherical objects).
     * @param {boolean} visible Whether or not the object should be displayed.
     * @returns {VisualElement}
    */
    constructor(name, position, color, size, visible) {
        this.name = name
        this.position = position;
        this.color = color;
        this.size = size;
        this.visible = visible;
        this.reference = null;

        if (visible)
            this.display();
    }

    /**
     * The default display behavior, displaying the element as sphere.
     * @returns {void}
    */
    display() {
        
    }

    remove() {
        if (this.reference == null) {
            VisualRepresentation.scene.remove(this.reference);
        }
    }
}
