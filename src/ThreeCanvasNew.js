import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvasNew = ({
  modelFileName,
  observerIds,
  cameraPos,
  statVizFlags,
  directionColors,
}) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(60, 1, 0.1, 1000));
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraPosRef = useRef(null);

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    const modelFilePath = `/Dataset/3d_models/${modelFileName}`;

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    // renderer.setSize(500, 500);
    renderer.setSize(
      (window.innerWidth * 5) / 12,
      (window.innerWidth * 5) / 12
    );
    renderer.setClearColor(0x19191e, 1);
    let controls = controlsRef.current;

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

      const material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "model";
      scene.add(mesh);

      // This could be adjusted to make sure the model is fully visible based on the camera's angle and the object's dimensions
      const cameraPosition = new THREE.Vector3(boundingBoxCenter.x, 144, 430);
      cameraPosRef.current = cameraPosition.clone();

      camera.position.copy(cameraPosition);
      camera.lookAt(boundingBoxCenter);

      // Update the controls target to look at the center of the model
      controls.target.copy(boundingBoxCenter);
    });

    // Add orbit controls to make the object rotatable and zoomable
    controls = new OrbitControls(camera, renderer.domElement);
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
    };
  }, [modelFileName]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;

    observerIds.forEach((observerId, index) => {
      if (observerId) {
        // Create a shallow copy of scene.children to safely iterate over
        const childrenCopy = scene.children.slice();

        childrenCopy.forEach((child) => {
          // Assuming statVizFlags is an array with the same length as the number of fixation elements
          if (child.name === `fixation-${index}`) {
            scene.remove(child); // Remove the child from the scene
          }
        });

        // Calculate the rotation angle in radians
        const degrees = (index - 3) * 15;
        const radians = degrees * (Math.PI / 180);

        // Get the original camera position
        const originalPosition = cameraPosRef.current.clone();

        // Create a rotation matrix for rotating around the Y axis
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(radians);

        // Apply the rotation to the camera position
        // Note: This assumes the focus point is at the origin. If not, you would need to translate the camera position to the focus point, apply the rotation, and then translate back.
        const rotatedPosition = originalPosition.applyMatrix4(rotationMatrix);

        const geometry = new THREE.SphereGeometry(10, 32, 32);
        const material = new THREE.MeshBasicMaterial({
          // color: colors.directions[index % colors.directions.length],
          color:
            directionColors[index] != null ? directionColors[index] : "#ffffff",
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(rotatedPosition);
        sphere.name = `direction-${index}`;
        scene.add(sphere);

        const jsonFileName = modelFileName.replace(".stl", ".json");
        const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

        function addFixationSpheres(fixations, offset, matrix, direction) {
          // Invert the matrix to apply the rotation in the opposite direction
          const invertedMatrix = matrix.clone().invert();

          fixations.forEach((fixation) => {
            const position = fixation.position;
            const radius = Math.max(1, (fixation.duration * 10) / 1000);
            const geometry = new THREE.SphereGeometry(radius, 32, 32); // Adjust the size as needed
            const material = new THREE.MeshBasicMaterial({
              // color: colors.directions[index % colors.directions.length],
              color:
                directionColors[index] != null
                  ? directionColors[index]
                  : "#ffffff",
            }); // Red color for visibility
            const sphere = new THREE.Mesh(geometry, material);

            sphere.position.x = position[0] - offset[0];
            sphere.position.y = position[1] - offset[1];
            sphere.position.z = position[2] - offset[2];

            // Apply the inverted matrix to each sphere
            sphere.applyMatrix4(invertedMatrix);

            sphere.name = `fixation-${direction}`;

            sphere.visible = statVizFlags[index];

            // Add the sphere to the scene
            sceneRef.current.add(sphere);
          });
        }

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
              // Access and log the orientation from the matching object
              const orientation = matchingObject.condition.orientation;

              const offset = matchingObject.condition.offset;

              // Creating a Matrix4 from the 3x3 rotation matrix
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

              // Read and console log the fixations attribute
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
    });
  }, [modelFileName, observerIds]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName || cameraPos == null) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    // Assuming cameraPos is available and is the value you want to match in the child's name
    const targetName = `direction-${cameraPos}`;
    const targetChild = scene.children.find(
      (child) => child.name === targetName
    );
    if (targetChild) {
      camera.position.copy(targetChild.position.clone());
    } else {
      console.log("No child found with the name:", targetName);
    }
  }, [modelFileName, cameraPos]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;

    // Loop through each statVizFlag
    statVizFlags.forEach((isVisible, index) => {
      // Construct the name to look for
      const targetName = `fixation-${index}`;

      // Find children with the matching name
      scene.children.forEach((child) => {
        if (child.name === targetName) {
          // Set visibility based on the corresponding statVizFlag
          child.visible = isVisible;
        }
      });
    });
  }, [modelFileName, statVizFlags]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;

    console.log("KOKOT");

    // Iterate through each key-value pair in directionColors
    Object.entries(directionColors).forEach(([key, colorValue]) => {
      // Iterate through each child in the scene
      scene.children.forEach((child) => {
        // Check if the child's name matches the pattern "direction-${key}" or "fixation-${key}"
        if (
          child.name === `direction-${key}` ||
          child.name === `fixation-${key}`
        ) {
          // Assuming the child is a Mesh and has a material property
          if (child.material && child.material.color) {
            // Update the color of the child
            child.material.color.set(colorValue);
          }
        }
      });
    });
  }, [directionColors]);

  return (
    <div
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        margin: "auto",
      }}
    />
  );
};

export default ThreeCanvasNew;
