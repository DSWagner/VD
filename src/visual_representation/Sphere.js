import VisualElement from './VisualElement';
import * as THREE from "three";
import VisualRepresentation from './VisualRepresentation';

export default class Sphere extends VisualElement {
    position;
    color;
    size;
    visible;
    reference;
    display() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(this.position);
        sphere.name = this.name;
        this.reference = sphere;
        VisualRepresentation.scene.add(sphere);
    }
}

