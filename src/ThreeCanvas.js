import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvas = ({
  observerId,
  modelFileName,
  timeViz,
  setTimeViz,
  obsPos,
  setObsPos,
}) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(60, 500 / 500, 0.1, 1000)
  );
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const originalCameraPosRef = useRef(null);
  const observerPosRef = useRef(null);

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    const modelFilePath = `/Dataset/3d_models/${modelFileName}`;

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    renderer.setSize(500, 500);
    renderer.setClearColor(0x19191e, 1);

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
      // mesh.position.x += 200;
      mesh.name = "shape";
      scene.add(mesh);

      // This could be adjusted to make sure the model is fully visible based on the camera's angle and the object's dimensions
      const cameraPosition = new THREE.Vector3(boundingBoxCenter.x, 144, 430);

      // console.log(camera.position);

      camera.position.copy(cameraPosition);
      camera.lookAt(boundingBoxCenter);

      originalCameraPosRef.current = camera.position.clone();

      // Update the controls target to look at the center of the model
      controls.target.copy(boundingBoxCenter);

      // Ensure the scene is rendered from the new camera position
      renderer.render(scene, camera);

      function addFixationSpheres(fixations, offset, matrix, rotationRadians) {
        // Invert the matrix to apply the rotation in the opposite direction
        const invertedMatrix = matrix.clone().invert();

        // Create a rotation matrix for y-axis
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(-rotationRadians);

        // Combine the rotation matrix with the inverted matrix
        const finalMatrix = new THREE.Matrix4();
        finalMatrix.multiplyMatrices(rotationMatrix, invertedMatrix);

        fixations.forEach((fixation) => {
          const position = fixation.position;
          const geometry = new THREE.SphereGeometry(5, 32, 32); // Adjust the size as needed
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Red color for visibility
          const sphere = new THREE.Mesh(geometry, material);

          sphere.position.x = position[0] - offset[0];
          sphere.position.y = position[1] - offset[1];
          sphere.position.z = position[2] - offset[2];

          // Apply the inverted matrix to each sphere
          sphere.applyMatrix4(finalMatrix);

          // Add the sphere to the scene
          sceneRef.current.add(sphere);
        });
      }

      // Load corresponding JSON file if observerId is selected
      if (observerId) {
        // Create a sphere geometry with a radius of 5 and 32 width/height segments
        const observerGeo = new THREE.SphereGeometry(10, 32, 32);
        // Create a blue basic material
        const observerMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        // Create a mesh with the geometry and material
        const observerSph = new THREE.Mesh(observerGeo, observerMat);
        // Set the name of the sphere
        observerSph.name = "observer";
        // Set the position of the sphere to the original camera position
        observerSph.position.copy(originalCameraPosRef.current);
        observerPosRef.current = observerSph.position.clone();
        // Add the sphere to the scene
        sceneRef.current.add(observerSph);

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
              // console.log("Found matching object:", matchingObject);
              // Access and log the orientation from the matching object
              const orientation = matchingObject.condition.orientation;
              // console.log("Orientation of the matching object:", orientation);

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

              // Define direction and calculate rotation in degrees
              const direction = matchingObject.condition.direction;
              console.log("Direction of the matching object:", direction);
              const rotationIncrement = 15; // Degrees to increment/decrement per direction unit
              let rotationDegrees = (direction - 3) * rotationIncrement;

              // Convert degrees to radians for THREE.js
              let rotationRadians = THREE.MathUtils.degToRad(rotationDegrees);
              // console.log(rotationRadians);

              // Apply rotation around Y axis
              mesh.rotation.y = rotationRadians;

              // Read and console log the fixations attribute
              const fixations = matchingObject.fixations;
              // console.log("Fixations:", fixations);
              addFixationSpheres(fixations, offset, matrix, rotationRadians);
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
    };
  }, [observerId, modelFileName]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (timeViz) {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const controls = controlsRef.current;

      scene.children = scene.children.filter((child) => {
        if (
          child.name === "red" ||
          child.name === "line" ||
          child.name === "vector"
        ) {
          if (child.geometry) {
            child.geometry.dispose(); // Disposes the geometry
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              // In case of multi-material
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose(); // Disposes the material
            }
          }
          return false; // Filter out the child, effectively removing it
        }
        return true; // Keep the child in the scene
      });

      function addFixationSpheres(
        fixations,
        offset,
        matrix,
        rotationRadians,
        index = 0
      ) {
        // Stop the recursion if we've displayed all fixations
        if (index >= fixations.length) {
          return;
        }
        // Find the last sphere added to the scene
        const lastSphere = sceneRef.current.children
          .filter(
            (child) => child instanceof THREE.Mesh && child.name === "red"
          )
          .pop();
        // Invert the matrix to apply the rotation in the opposite direction
        const invertedMatrix = matrix.clone().invert();
        // Create a rotation matrix for y-axis
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(-rotationRadians);

        // Combine the rotation matrix with the inverted matrix
        const finalMatrix = new THREE.Matrix4();
        finalMatrix.multiplyMatrices(rotationMatrix, invertedMatrix);

        const fixation = fixations[index];
        const position = fixation.position;
        const geometry = new THREE.SphereGeometry(5, 32, 32); // Adjust the size as needed
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Green color for visibility
        const sphere = new THREE.Mesh(geometry, material);

        sphere.name = "red";

        sphere.position.x = position[0] - offset[0];
        sphere.position.y = position[1] - offset[1];
        sphere.position.z = position[2] - offset[2];

        // Apply the inverted matrix to each sphere
        sphere.applyMatrix4(finalMatrix);

        const originalPos = sphere.position;

        const directionVector = new THREE.Vector3(
          originalCameraPosRef.current.x - sphere.position.x,
          originalCameraPosRef.current.y - sphere.position.y,
          originalCameraPosRef.current.z - sphere.position.z
        ).normalize();

        const observerDist = originalPos.distanceTo(observerPosRef.current);
        // Create an arrow helper with the direction vector
        const arrowHelper = new THREE.ArrowHelper(
          directionVector,
          sphere.position,
          observerDist,
          0x800080,
          0,
          0
        ); // 0x800080 is the color purple
        arrowHelper.name = "vector";
        sceneRef.current.add(arrowHelper);

        const zDistance =
          -originalPos.z + 75 + index * (200 / fixations.length);
        const newPosition = new THREE.Vector3()
          .copy(sphere.position)
          .add(directionVector.multiplyScalar(zDistance));

        // Set the new position to the sphere
        sphere.position.copy(newPosition);
        // sphere.position.z = zDistance;
        console.log(sphere.position.z);

        // Add the sphere to the scene
        sceneRef.current.add(sphere);

        // If there's a last sphere, draw a line to the current sphere
        if (index > 0 && lastSphere) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            lastSphere.position,
            sphere.position,
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          line.name = "line";
          scene.add(line);
        }

        // Animation logic
        let startTime = Date.now();
        let endTime = startTime + fixation.duration;

        function animate() {
          let now = Date.now();
          let elapsed = now - startTime;
          let fraction = elapsed / 75;

          if (now < endTime) {
            // Update sphere scale based on the fraction of the duration elapsed
            // This example linearly scales the sphere from 1 to 2 times its original size
            let scale = Math.log(fraction); // Adjust this formula as needed
            sphere.scale.set(scale, scale, scale);

            requestAnimationFrame(animate);
          } else {
            // Continue with the next fixation
            addFixationSpheres(
              fixations,
              offset,
              matrix,
              rotationRadians,
              index + 1
            );
          }
        }

        animate();
      }

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
              // console.log("Found matching object:", matchingObject);
              // Access and log the orientation from the matching object
              const orientation = matchingObject.condition.orientation;
              // console.log("Orientation of the matching object:", orientation);

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

              // Define direction and calculate rotation in degrees
              const direction = matchingObject.condition.direction;
              console.log("Direction of the matching object:", direction);
              const rotationIncrement = 15; // Degrees to increment/decrement per direction unit
              let rotationDegrees = (direction - 3) * rotationIncrement;

              // Convert degrees to radians for THREE.js
              let rotationRadians = THREE.MathUtils.degToRad(rotationDegrees);
              // console.log(rotationRadians);

              // Read and console log the fixations attribute
              const fixations = matchingObject.fixations;
              // console.log("Fixations:", fixations);
              addFixationSpheres(fixations, offset, matrix, rotationRadians);
            } else {
              console.log(
                "No matching object found for observer ID:",
                observerId
              );
            }
          })
          .catch((error) => console.error("Error loading JSON file:", error));
      }

      setTimeViz(false);

      // Animation loop to render the scene
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update(); // Required if damping or auto-rotation is enabled
        renderer.render(scene, camera);
      };
      animate();
    }
  }, [observerId, modelFileName, timeViz, setTimeViz]);

  useEffect(() => {
    if (obsPos) {
      // Assuming camera and observerPosRef are defined and accessible in this scope
      const camera = cameraRef.current;
      camera.position.copy(observerPosRef.current);
      // Reset obsPos to false for future use
      setObsPos(false);
    }
  }, [obsPos, setObsPos]);

  return (
    <div
      ref={canvasRef}
      style={{ width: "500px", height: "500px", margin: "auto" }}
    />
  );
};

export default ThreeCanvas;
