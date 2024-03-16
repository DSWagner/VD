import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvasNew = ({
  //   observerId,
  modelFileName,
  observerIds,
  cameraPos,
  //   timeViz,
  //   setTimeViz,
  //   obsPos,
  //   setObsPos,
}) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(60, 500 / 500, 0.1, 1000)
  );
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraPosRef = useRef(null);
  //   const originalCameraPosRef = useRef(null);
  //   const observerPosRef = useRef(null);

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided
    const modelFilePath = `/Dataset/3d_models/${modelFileName}`;

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    renderer.setSize(500, 500);
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
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    renderer.setSize(500, 500);
    renderer.setClearColor(0x19191e, 1);
    const controls = controlsRef.current;

    observerIds.forEach((observerId, index) => {
      // console.log(observerId);
      if (observerId) {
        console.log(observerId);

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

        // Now, rotatedPosition contains the observer's position after applying the rotation
        console.log(
          `Observer ${observerId} rotated position:`,
          rotatedPosition
        );

        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(rotatedPosition);
        sphere.name = `direction-${index}`;
        scene.add(sphere);
      }
    });
  }, [modelFileName, observerIds]); // Depend on modelFileName to re-trigger loading

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    renderer.setSize(500, 500);
    renderer.setClearColor(0x19191e, 1);
    const controls = controlsRef.current;

    // Assuming cameraPos is available and is the value you want to match in the child's name
    const targetName = `direction-${cameraPos}`;
    const targetChild = scene.children.find(
      (child) => child.name === targetName
    );
    if (targetChild) {
      console.log("Found child:", targetChild);
      camera.position.copy(targetChild.position.clone());
    } else {
      console.log("No child found with the name:", targetName);
    }
  }, [modelFileName, cameraPos]); // Depend on modelFileName to re-trigger loading

  return (
    <div
      ref={canvasRef}
      style={{ width: "500px", height: "500px", margin: "auto" }}
    />
  );
};

export default ThreeCanvasNew;
