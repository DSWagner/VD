export default class VisualElement {
    positionX;
    positionY;
    positionZ;
    color;
    size;
    visible;
    reference;

    /**
     * Initializes the "abstract" visual element.
     * @param {number} x The X coordinate.
     * @param {number} y The Y coordinate.
     * @param {number} z The Z coordinate.
     * @param {string} color A hex representation of the desired color.
     * @param {number} size The size of the element (interpreted as radius for spherical objects).
     * @param {boolean} visible Whether or not the object should be displayed.
     * @returns {VisualElement}
    */
    constructor(x, y, z, color, size, visible) {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;
        this.color = color;
        this.size = size;
        this.visible = visible;

        if (visible)
            this.display();
    }

    /**
     * The default display behavior, displaying the element as sphere.
     * @returns {void}
    */
    display() {
        this.reference = null;
    }
}
