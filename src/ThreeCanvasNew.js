import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import VisualRepresentation from "./visual_representation/VisualRepresentation";

const ThreeCanvasNew = ({
  modelFileName,
  observerIds,
  cameraPos,
  statVizFlags,
  dynaVizFlags,
  directionColors,
  paramFlag,
  sliderValue,
}) => {
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraPosRef = useRef(null);
  const centerRef = useRef(null);
  // Inside your component
  const prevDynaVizFlagsRef = useRef();

  /* Resizes the canvas based on whether the parameter tab is active */
  useEffect(() => {
    // const renderer = rendererRef.current;
    const newSize = (window.innerWidth * paramFlag) / 12;
    VisualRepresentation.renderer.setSize(newSize, newSize);
    VisualRepresentation.renderer.setClearColor(0x19191e, 1);
  }, [paramFlag]);

  /* Loads new model when new model is selected */
  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    
    // const rendererSize = (window.innerWidth * paramFlag) / 12;
    // VisualRepresentation.renderer.setSize(rendererSize, rendererSize);
    // VisualRepresentation.renderer.setClearColor(0x19191e, 1);

    let controls = controlsRef.current;

    // Append the renderer to the canvas div
    canvasRef.current.innerHTML = ""; // Clear the canvas container
    canvasRef.current.appendChild(VisualRepresentation.renderer.domElement);
    
    controls = new OrbitControls(VisualRepresentation.camera, VisualRepresentation.renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia), which makes for smoother orbiting
    controls.dampingFactor = 0.1;
    controls.addEventListener("change", () => VisualRepresentation.renderer.render(VisualRepresentation.scene, VisualRepresentation.camera)); // Update the view on control change
      

    VisualRepresentation.loadModelAsync(modelFileName).then((bbCenter) => {
      controls.target.copy(bbCenter);

      const cameraPosition = new THREE.Vector3(bbCenter.x, 144, 430);
      cameraPosRef.current = cameraPosition.clone();
      VisualRepresentation.camera.position.copy(cameraPosition);
      VisualRepresentation.camera.lookAt(bbCenter);
      centerRef.current = bbCenter.clone();

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update(); // Required if damping or auto-rotation is enabled
        VisualRepresentation.renderer.render(VisualRepresentation.scene, VisualRepresentation.camera);
      };
      animate();
    });
    
    return () => {
      // Cleanup on component unmount or modelFileName change
      VisualRepresentation.scene.clear(); // Clear the scene
      VisualRepresentation.renderer.dispose(); // Dispose of the renderer
      controls.dispose();
    };
  }, [modelFileName]); // Depend on modelFileName to re-trigger loading


  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    
    
    observerIds.forEach((observerIdGroup, index) => {
      // VisualRepresentation.removeFixations(index, "static");

      // Create a shallow copy of scene.children to safely iterate over
      const childrenCopy = VisualRepresentation.scene.children.slice();
      console.log("children start:")
      console.log(childrenCopy)
      console.log("children end")

      childrenCopy.forEach((child) => {
        // Assuming statVizFlags is an array with the same length as the number of fixation elements
        if (child.name === `stat-fixation-${index}`) {
          VisualRepresentation.scene.remove(child); // Remove the child from the scene
        }
      });
      if (observerIdGroup) {
        observerIdGroup.forEach((observerId) => {
          // Calculate the rotation angle in radians
          const degrees = (index - 3) * 15;
          const radians = degrees * (Math.PI / 180);

          // Get the original camera position
          const originalPosition = cameraPosRef.current.clone();

          // Create a rotation matrix for rotating around the Y axis
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.makeRotationY(radians);

          // Apply the rotation to the camera position
          const rotatedPosition = originalPosition.applyMatrix4(rotationMatrix);

          const geometry = new THREE.SphereGeometry(10, 32, 32);
          const material = new THREE.MeshBasicMaterial({
            color:
              directionColors[index] != null
                ? directionColors[index]
                : "#ffffff",
          });
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.copy(rotatedPosition);
          sphere.name = `direction-${index}`;
          VisualRepresentation.scene.add(sphere);

          const jsonFileName = modelFileName.replace(".stl", ".json");
          const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

          function addFixationSpheres(fixations, offset, matrix, direction) {
            const invertedMatrix = matrix.clone().invert();

            fixations.forEach((fixation) => {
              const position = fixation.position;
              const radius = Math.max(1, (fixation.duration * 10) / 1000);
              const geometry = new THREE.SphereGeometry(radius, 32, 32);
              const material = new THREE.MeshBasicMaterial({
                color:
                  directionColors[index] != null
                    ? directionColors[index]
                    : "#ffffff",
              });
              const sphere = new THREE.Mesh(geometry, material);

              sphere.position.x = position[0] - offset[0];
              sphere.position.y = position[1] - offset[1];
              sphere.position.z = position[2] - offset[2];

              sphere.applyMatrix4(invertedMatrix);

              sphere.name = `stat-fixation-${direction}`;

              sphere.visible = statVizFlags[index];

              VisualRepresentation.scene.add(sphere);
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
              const matchingObject = data.find(
                (item) =>
                  item["observer id"].toString() === observerId.toString()
              );
              if (matchingObject) {
                const orientation = matchingObject.condition.orientation;
                const offset = matchingObject.condition.offset;
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
        });
      }
    });
  }, [modelFileName, observerIds]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName || cameraPos == null) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    // const scene = sceneRef.current;
    // const camera = cameraRef.current;

    // Assuming cameraPos is available and is the value you want to match in the child's name
    const targetName = `direction-${cameraPos}`;
    const targetChild = VisualRepresentation.scene.children.find(
      (child) => child.name === targetName
    );
    if (targetChild) {
      VisualRepresentation.camera.position.copy(targetChild.position.clone());
    } else {
      console.log("No child found with the name:", targetName);
    }
  }, [modelFileName, cameraPos]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    // const scene = sceneRef.current;

    // Loop through each statVizFlag
    statVizFlags.forEach((isVisible, index) => {
      // Construct the name to look for
      const targetName = `stat-fixation-${index}`;

      // Find children with the matching name
      VisualRepresentation.scene.children.forEach((child) => {
        if (child.name === targetName) {
          // Set visibility based on the corresponding statVizFlag
          child.visible = isVisible;
        }
      });
    });
  }, [modelFileName, statVizFlags]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    // Initialize scene, camera, and renderer
    // const scene = sceneRef.current;

    // Iterate through each key-value pair in directionColors
    Object.entries(directionColors).forEach(([key, colorValue]) => {
      // Iterate through each child in the scene
      VisualRepresentation.scene.children.forEach((child) => {
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
    // const scene = sceneRef.current;

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
      const childrenCopy = VisualRepresentation.scene.children.slice();

      childrenCopy.forEach((child) => {
        // Assuming statVizFlags is an array with the same length as the number of fixation elements
        if (
          child.name === `dyna-fixation-${direction}` ||
          child.name === `line-${direction}`
        ) {
          VisualRepresentation.scene.remove(child); // Remove the child from the scene
        }
      });
    } else {
      const observerIdGroup = observerIds[direction];
      console.log("Observer ID: ", observerIdGroup);
      console.log("FLAG: ", dynaVizFlags[direction]);

      if (observerIdGroup) {
        const jsonFileName = modelFileName.replace(".stl", ".json");
        const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

        observerIdGroup.forEach((observerId) => {
          // Iterate through each observerId in the group
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
            const radius = Math.max(1, (fixation.duration * 10) / 1000);
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
              opacity: 0.6, // Set opacity to 75%
              transparent: true, // Enable transparency
            });
            const cylinder = new THREE.Mesh(geometry, material);

            cylinder.position.x = position[0] - offset[0];
            cylinder.position.y = position[1] - offset[1];
            cylinder.position.z = position[2] - offset[2];
            cylinder.applyMatrix4(invertedMatrix);
            cylinder.name = `dyna-fixation-${direction}`;
            // sceneRef.current.add(sphere);

            const observerChild = VisualRepresentation.scene.children.find(
              (child) => child.name === `direction-${direction}`
            );

            if (observerChild) {
              const observerPosition = observerChild.position;
              const vectorFromModelToObserver = new THREE.Vector3().subVectors(
                observerPosition,
                centerRef.current
              );

              const targetPosition = new THREE.Vector3().addVectors(
                cylinder.position,
                vectorFromModelToObserver
              );
              cylinder.lookAt(targetPosition);
              cylinder.rotateX(Math.PI / 2);

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
                  opacity: 0.6, // Set opacity to 75%
                  transparent: true, // Enable transparency
                });

                // Create the line and add it to the scene
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.name = `line-${direction}`;
                VisualRepresentation.scene.add(line);
              }
              lastCylinderPosition = cylinder.position
                .clone()
                .sub(incrementalMoveVector.clone().multiplyScalar(-increment));
                VisualRepresentation.scene.add(cylinder);
            }

            const delay = fixations[index + 1]
              ? (fixations[index + 1]["start timestamp"] -
                  fixations[index]["start timestamp"]) *
                1000
              : fixation.duration;

            // Recursive call with the next index
            setTimeout(() => {
              addFixationSpheres(
                fixations,
                offset,
                matrix,
                direction,
                index + 1
              );
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
                (item) =>
                  item["observer id"].toString() === observerId.toString()
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
        });
      }
    }

    console.log(direction);
  }, [dynaVizFlags]);

  useEffect(() => {
    const updateVisibilityBasedOnModelPosition = () => {
      // const scene = sceneRef.current;
      const maxDistance = 400; // Maximum distance from the origin point to consider
      // Find the model object
      const modelObject = VisualRepresentation.scene.children.find(
        (child) => child.name === "model"
      );
      if (!modelObject) {
        console.error("Model object not found");
        return;
      }
      const modelPosition = modelObject.position;

      VisualRepresentation.scene.children.forEach((child) => {
        if (child.name.includes("line")) {
          // Assuming the line is a THREE.Line object with a geometry attribute
          const vertices = child.geometry.attributes.position.array;
          let avgX = 0,
            avgY = 0,
            avgZ = 0;
          for (let i = 0; i < vertices.length; i += 3) {
            avgX += vertices[i];
            avgY += vertices[i + 1];
            avgZ += vertices[i + 2];
          }
          const numVertices = vertices.length / 3;
          avgX /= numVertices;
          avgY /= numVertices;
          avgZ /= numVertices;

          // Create a vector for the average position
          const avgPosition = new THREE.Vector3(avgX, avgY, avgZ);
          // Calculate the distance from the model's position to this average position
          const distanceFromModel = avgPosition.distanceTo(modelPosition);
          // Set visibility based on the calculated distance and sliderValue
          child.visible = distanceFromModel <= sliderValue;
        } else if (child.name.includes("dyna-fixation")) {
          const distanceFromModel = child.position.distanceTo(modelPosition);
          child.visible = distanceFromModel <= sliderValue;
        }
      });
    };

    updateVisibilityBasedOnModelPosition();
  }, [sliderValue]);

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
