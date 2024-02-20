import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvas = ({ observerId, modelFileName }) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(60, 500 / 500, 0.1, 1000)
  );
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    const modelFilePath = `/Dataset/3d_models/${modelFileName}`;

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    sceneRef.current = scene; // Store the scene in a ref
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    renderer.setSize(500, 500);

    // Append the renderer to the canvas div
    canvasRef.current.innerHTML = ""; // Clear the canvas container
    canvasRef.current.appendChild(renderer.domElement);

    // Load the STL model
    const loader = new STLLoader();
    loader.load(modelFilePath, (geometry) => {
      geometry.computeBoundingBox();
      const boundingBoxCenter = geometry.boundingBox.getCenter(
        new THREE.Vector3()
      );

      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "shape";
      scene.add(mesh);

      // Calculate a suitable position for the camera
      const size = geometry.boundingBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

      // This could be adjusted to make sure the model is fully visible based on the camera's angle and the object's dimensions
      cameraZ *= 5; // Increase the multiplier to move the camera further away
      const cameraPosition = new THREE.Vector3(
        boundingBoxCenter.x,
        // boundingBoxCenter.y,
        // boundingBoxCenter.z + cameraZ
        144,
        430
      );

      console.log(camera.position);

      camera.position.copy(cameraPosition);
      camera.lookAt(boundingBoxCenter);

      // Update the controls target to look at the center of the model
      controls.target.copy(boundingBoxCenter);

      // Ensure the scene is rendered from the new camera position
      renderer.render(scene, camera);

      // Load corresponding JSON file if observerId is selected
      if (observerId) {
        const jsonFileName = modelFileName.replace(".stl", ".json");
        const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

        // Fetch the JSON file
        fetch(jsonFilePath)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            // Assuming 'data' is the array of objects
            const matchingObject = data.find(
              (item) => item["observer id"].toString() === observerId.toString()
            );
            if (matchingObject) {
              console.log("Found matching object:", matchingObject);
              // Access and log the orientation from the matching object
              const orientation = matchingObject.condition.orientation;
              console.log("Orientation of the matching object:", orientation);

              // Define direction and calculate rotation in degrees
              const direction = matchingObject.condition.direction;
              console.log("Direction of the matching object:", direction);
              const baseRotationDegrees = 0; // Base rotation for direction 3
              const rotationIncrement = 15; // Degrees to increment/decrement per direction unit
              let rotationDegrees =
                baseRotationDegrees + (direction - 3) * rotationIncrement;

              // Convert degrees to radians for THREE.js
              let rotationRadians = THREE.MathUtils.degToRad(rotationDegrees);

              // Apply rotation around Y axis
              mesh.rotation.y = rotationRadians;
            } else {
              console.log(
                "No matching object found for observer ID:",
                observerId
              );
            }
          })
          .catch((error) => console.error("Error loading JSON file:", error));
      }
    });

    // Add orbit controls to make the object rotatable and zoomable
    controlsRef.current = new OrbitControls(camera, renderer.domElement);
    const controls = controlsRef.current;
    controls.enableDamping = true; // Enable damping (inertia), which makes for smoother orbiting
    controls.dampingFactor = 0.1;
    controls.addEventListener("change", () => renderer.render(scene, camera)); // Update the view on control change

    // Animation loop to render the scene
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Required if damping or auto-rotation is enabled
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Cleanup on component unmount or modelFileName change
      scene.clear(); // Clear the scene
      renderer.dispose(); // Dispose of the renderer
      controls.dispose();
      console.log(controls);
    };
  }, [observerId, modelFileName]); // Depend on modelFileName to re-trigger loading

  return (
    <div
      ref={canvasRef}
      style={{ width: "500px", height: "500px", margin: "auto" }}
    />
  );
};

export default ThreeCanvas;
