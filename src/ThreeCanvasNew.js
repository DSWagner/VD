import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvasNew = ({
  modelFileName,
  observerIds,
  cameraPos,
  statVizFlags,
  dynaVizFlags,
  directionColors,
}) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(60, 1, 0.1, 10000));
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraPosRef = useRef(null);
  const centerRef = useRef(null);
  // Inside your component
  const prevDynaVizFlagsRef = useRef();

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
      centerRef.current = boundingBoxCenter.clone();

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
          if (child.name === `stat-fixation-${index}`) {
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

            sphere.name = `stat-fixation-${direction}`;

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
      const targetName = `stat-fixation-${index}`;

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

    // Iterate through each key-value pair in directionColors
    Object.entries(directionColors).forEach(([key, colorValue]) => {
      // Iterate through each child in the scene
      scene.children.forEach((child) => {
        // Check if the child's name matches the pattern "direction-${key}" or "stat-fixation-${key}"
        if (
          child.name === `direction-${key}` ||
          child.name === `stat-fixation-${key}` ||
          child.name === `dyna-fixation-${key}` ||
          child.name === `line-${key}`
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

  useEffect(() => {
    // Initialize scene, camera, and renderer
    if (!modelFileName) return;
    const scene = sceneRef.current;

    const prevDynaVizFlags = prevDynaVizFlagsRef.current;
    let direction = -1;

    console.log(prevDynaVizFlags);
    console.log(dynaVizFlags);

    if (prevDynaVizFlags) {
      dynaVizFlags.forEach((flag, index) => {
        if (flag !== prevDynaVizFlags[index]) {
          console.log(`Value changed at index ${index}:`, flag);
          direction = index;
        }
      });
    }

    console.log(direction);
    // Update the ref to the current state for the next render
    prevDynaVizFlagsRef.current = dynaVizFlags;

    if (direction == -1) return;

    if (!dynaVizFlags[direction]) {
      console.log("VYMAZ");
      // Create a shallow copy of scene.children to safely iterate over
      const childrenCopy = scene.children.slice();

      childrenCopy.forEach((child) => {
        // Assuming statVizFlags is an array with the same length as the number of fixation elements
        if (
          child.name === `dyna-fixation-${direction}` ||
          child.name === `line-${direction}`
        ) {
          scene.remove(child); // Remove the child from the scene
        }
      });
    } else {
      const observerId = observerIds[direction];
      console.log("KOKOT");
      console.log("Observer ID: ", observerId);
      console.log("FLAG: ", dynaVizFlags[direction]);

      if (observerId) {
        const jsonFileName = modelFileName.replace(".stl", ".json");
        const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

        let lastCylinderPosition = null; // Outside the function, to keep track of the last cylinder's position
        function addFixationSpheres(
          fixations,
          offset,
          matrix,
          direction,
          index = 0
        ) {
          // Base case: if index is out of bounds, return to stop the recursion
          if (index >= fixations.length) {
            return;
          }

          const fixation = fixations[index];
          const invertedMatrix = matrix.clone().invert();
          const position = fixation.position;
          const radius = Math.max(1, (fixation.duration * 20) / 1000);
          const geometry = new THREE.CylinderGeometry(
            radius,
            radius,
            fixation.duration / 20,
            32
          );
          const material = new THREE.MeshBasicMaterial({
            color:
              directionColors[direction] != null
                ? directionColors[direction]
                : "#ffffff",
          });
          const cylinder = new THREE.Mesh(geometry, material);

          cylinder.position.x = position[0] - offset[0];
          cylinder.position.y = position[1] - offset[1];
          cylinder.position.z = position[2] - offset[2];
          cylinder.applyMatrix4(invertedMatrix);
          cylinder.name = `dyna-fixation-${direction}`;
          // sceneRef.current.add(sphere);

          const observerChild = scene.children.find(
            (child) => child.name === `direction-${direction}`
          );

          if (observerChild) {
            const observerPosition = observerChild.position;
            const vectorFromModelToObserver = new THREE.Vector3().subVectors(
              observerPosition,
              centerRef.current
            );

            // const targetPosition = new THREE.Vector3().subVectors(
            //   cylinder.position,
            //   vectorFromModelToObserver
            // );
            // cylinder.lookAt(targetPosition);

            // Calculate the projection of sphere.position onto vectorFromModelToObserver
            const projectionScalar =
              cylinder.position.dot(vectorFromModelToObserver) /
              vectorFromModelToObserver.lengthSq();
            console.log(projectionScalar);
            const projectionVector = vectorFromModelToObserver
              .clone()
              .multiplyScalar(projectionScalar);

            // Calculate the distance from the projection point to the origin of the vector
            const originToProjectionDistance = projectionVector.length();
            // Move the sphere by this distance in the opposite direction of the vector
            let moveDirection = vectorFromModelToObserver.normalize();
            moveDirection =
              projectionScalar >= 0 ? moveDirection.negate() : moveDirection;
            const moveVector = moveDirection.multiplyScalar(
              originToProjectionDistance
            );
            cylinder.position.add(moveVector);

            // Now, apply an incremental distance to the sphere in the direction of vectorFromModelToObserver
            // Normalize the vector for direction, and scale it by the incremental distance
            const incrementalMoveVector =
              projectionScalar >= 0
                ? vectorFromModelToObserver.normalize().negate()
                : vectorFromModelToObserver.normalize();
            let increment = 100 + fixation["start timestamp"] * 50;
            let incrementaDistance = incrementalMoveVector
              .clone()
              .multiplyScalar(increment);
            cylinder.position.add(incrementaDistance);

            const currentCylinderPosition = cylinder.position.clone();

            increment = fixation.duration / 40;
            incrementaDistance = incrementalMoveVector
              .clone()
              .multiplyScalar(increment);
            cylinder.position.add(incrementaDistance);

            // Check if there's a previous cylinder to connect to
            if (lastCylinderPosition) {
              // Create a geometry that represents a line between the last cylinder and the current one
              const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                lastCylinderPosition,
                currentCylinderPosition,
              ]);

              // Use the same material color as the cylinder
              const lineMaterial = new THREE.LineBasicMaterial({
                color:
                  directionColors[direction] != null
                    ? directionColors[direction]
                    : "#ffffff",
              });

              // Create the line and add it to the scene
              const line = new THREE.Line(lineGeometry, lineMaterial);
              line.name = `line-${direction}`;
              sceneRef.current.add(line);
            }
            lastCylinderPosition = cylinder.position
              .clone()
              .sub(incrementalMoveVector.clone().multiplyScalar(-increment));
            sceneRef.current.add(cylinder);
          }

          const delay = fixations[index + 1]
            ? (fixations[index + 1]["start timestamp"] -
                fixations[index]["start timestamp"]) *
              1000
            : fixation.duration;

          // Recursive call with the next index
          setTimeout(() => {
            addFixationSpheres(fixations, offset, matrix, direction, index + 1);
          }, delay);
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
              if (fixations) {
                setTimeout(() => {
                  addFixationSpheres(fixations, offset, matrix, direction);
                }, fixations[0]["start timestamp"] * 1000);
              }
            } else {
              console.log(
                "No matching object found for observer ID:",
                observerId
              );
            }
          })
          .catch((error) => console.error("Error loading JSON file:", error));
      }
    }

    console.log(direction);
  }, [dynaVizFlags]);

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
