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
  paramFlag,
  rangeValues,
  advancedViewFlags,
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
    const renderer = rendererRef.current;
    const newSize = (window.innerWidth * paramFlag) / 12;
    renderer.setSize(newSize, newSize);
  }, [paramFlag]); // Depend on paramFlag to re-trigger this effect

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    const modelFilePath = `/Dataset/3d_models/${modelFileName}`;

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    // renderer.setSize(500, 500);
    const mainViewportSize = (window.innerWidth * paramFlag) / 12;
    renderer.setSize(mainViewportSize, mainViewportSize);
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
    // // Animation loop to render the scene
    // const animate = () => {
    //   requestAnimationFrame(animate);
    //   controls.update();

    //   // Render the main viewport
    //   renderer.setViewport(0, 0, mainViewportSize, mainViewportSize);
    //   renderer.setScissor(0, 0, mainViewportSize, mainViewportSize);
    //   renderer.setScissorTest(true);
    //   renderer.clearColor();
    //   renderer.render(scene, camera);

    //   // Render the smaller viewport in the top right corner
    //   const smallViewportSize = mainViewportSize / 4;
    //   const offsetX = mainViewportSize - smallViewportSize;
    //   const offsetY = 0; // Top right corner
    //   renderer.setViewport(
    //     offsetX,
    //     offsetY,
    //     smallViewportSize,
    //     smallViewportSize
    //   );
    //   renderer.setScissor(
    //     offsetX,
    //     offsetY,
    //     smallViewportSize,
    //     smallViewportSize
    //   );
    //   renderer.setScissorTest(true);
    //   renderer.clearColor();
    //   renderer.render(scene, camera);
    // };
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

    observerIds.forEach((observerIdGroup, index) => {
      // Create a shallow copy of scene.children to safely iterate over
      const childrenCopy = scene.children.slice();

      childrenCopy.forEach((child) => {
        // Assuming statVizFlags is an array with the same length as the number of fixation elements
        if (child.name === `stat-fixation-${index}`) {
          scene.remove(child); // Remove the child from the scene
        }
      });
      if (observerIdGroup && observerIdGroup.length > 0) {
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

          const observerChild = scene.children.find(
            (child) => child.name === `direction-${index}`
          );
          if (observerChild) {
            scene.remove(observerChild);
          }

          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.copy(rotatedPosition);
          sphere.name = `direction-${index}`;
          scene.add(sphere);

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
      } else {
        // Remove the child with name `direction-${index}`
        const directionChild = scene.children.find(
          (child) => child.name === `direction-${index}`
        );
        if (directionChild) {
          scene.remove(directionChild);
        }
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

      const isAdvanced =
        advancedViewFlags[index] ||
        !advancedViewFlags.some((flag) => flag === true);

      // Find children with the matching name
      scene.children.forEach((child) => {
        if (child.name === targetName && isAdvanced) {
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

    if (prevDynaVizFlags) {
      dynaVizFlags.forEach((flag, index) => {
        if (flag !== prevDynaVizFlags[index]) {
          console.log(`Value changed at index ${index}:`, flag);
          direction = index;
        }
      });
    }

    // Update the ref to the current state for the next render
    prevDynaVizFlagsRef.current = dynaVizFlags;

    if (direction == -1) return;

    if (!dynaVizFlags[direction]) {
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
      const observerIdGroup = observerIds[direction];

      if (observerIdGroup && observerIdGroup.length > 0) {
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

            const observerChild = scene.children.find(
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

    // console.log(direction);
  }, [dynaVizFlags]);

  useEffect(() => {
    const updateVisibilityBasedOnModelPosition = () => {
      const scene = sceneRef.current;
      // Find the model object
      const modelObject = scene.children.find(
        (child) => child.name === "model"
      );
      if (!modelObject) {
        console.log("Model object not found");
        return;
      }

      // Ensure the geometry has a bounding box
      if (!modelObject.geometry.boundingBox) {
        modelObject.geometry.computeBoundingBox();
      }

      // Calculate the center of the bounding box
      const modelCenterPosition = new THREE.Vector3();
      modelObject.geometry.boundingBox.getCenter(modelCenterPosition);

      // const modelPosition = modelObject.position;

      // Create an array to hold children whose name includes "direction"
      const directionChildren = scene.children.filter((child) =>
        child.name.includes("direction")
      );

      // Create an object to store direction vectors with their corresponding index
      const directionVectors = {};

      directionChildren.forEach((directionChild) => {
        const directionVector = new THREE.Vector3();
        directionVector.subVectors(
          directionChild.position,
          modelCenterPosition
        );
        // Use the index from the name of the directionChild as the key
        const splitName = directionChild.name.split("-");
        const index = splitName[splitName.length - 1];
        directionVectors[index] = directionVector;
      });

      // Filter scene children where child.name includes "line" or "dyna-fixation"
      const filteredChildren = scene.children.filter(
        (child) =>
          child.name.includes("line") || child.name.includes("dyna-fixation")
      );

      // Iterate through the filtered children
      filteredChildren.forEach((child) => {
        const splitName = child.name.split("-");
        const index = splitName[splitName.length - 1];
        if (
          !advancedViewFlags.some((flag) => flag) ||
          advancedViewFlags[index]
        ) {
          if (directionVectors[index]) {
            let childPosition = new THREE.Vector3();

            if (child.type === "Line") {
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
              childPosition.set(avgX, avgY, avgZ);
            } else {
              childPosition.copy(child.position);
            }

            const projectionScalar =
              childPosition.dot(directionVectors[index]) /
              directionVectors[index].lengthSq();
            const projection = directionVectors[index]
              .clone()
              .multiplyScalar(projectionScalar);
            const distance = modelCenterPosition.distanceTo(projection);
            child.visible =
              distance >= rangeValues.min && distance <= rangeValues.max;
          }
        }
      });
    };

    updateVisibilityBasedOnModelPosition();
  }, [rangeValues]);

  useEffect(() => {
    const scene = sceneRef.current;
    const isAdvanced = advancedViewFlags.some((flag) => flag === true);

    // Iterate over all children in the scene
    scene.children.forEach((child) => {
      // Default visibility to false unless conditions are met
      let isVisible = false;

      // Check if the child's name is "model"
      if (isAdvanced) {
        if (child.name === "model") {
          isVisible = true;
        } else {
          // Check each flag in advancedViewFlags
          advancedViewFlags.forEach((flag, index) => {
            if (flag && child.name === `direction-${index}`) {
              isVisible = true;
            } else if (flag && child.name === `stat-fixation-${index}`) {
              isVisible = statVizFlags[index];
            } else if (
              flag &&
              (child.name === `dyna-fixation-${index}` ||
                child.name === `line-${index}`)
            ) {
              isVisible = dynaVizFlags[index];
            }
          });
        }
      } else {
        if (child.name === "model") {
          isVisible = true;
        } else {
          advancedViewFlags.forEach((flag, index) => {
            if (child.name === `direction-${index}`) {
              isVisible = true;
            } else if (child.name === `stat-fixation-${index}`) {
              isVisible = statVizFlags[index];
            } else if (
              child.name === `dyna-fixation-${index}` ||
              child.name === `line-${index}`
            ) {
              isVisible = dynaVizFlags[index];
            }
          });
        }
      }

      // Set the visibility of the child
      child.visible = isVisible;
    });
  }, [advancedViewFlags]); // Depend on advancedViewFlags to re-trigger this effect

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
