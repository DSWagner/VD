import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeCanvas = ({ modelFileName }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null); // Keep a ref to the scene

  useEffect(() => {
    if (!modelFileName) return; // Don't proceed if modelFileName is not provided

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene; // Store the scene in a ref
    const camera = new THREE.PerspectiveCamera(60, 500 / 500, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(500, 500);

    // Append the renderer to the canvas div
    canvasRef.current.innerHTML = ""; // Clear the canvas container
    canvasRef.current.appendChild(renderer.domElement);

    // Load the STL model
    const loader = new STLLoader();
    loader.load(modelFileName, (geometry) => {
      geometry.computeBoundingBox();
      const boundingBoxCenter = geometry.boundingBox.getCenter(
        new THREE.Vector3()
      );

      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
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
        boundingBoxCenter.y,
        boundingBoxCenter.z + cameraZ
      );

      camera.position.copy(cameraPosition);
      camera.lookAt(boundingBoxCenter);

      // Update the controls target to look at the center of the model
      controls.target.copy(boundingBoxCenter);

      // Ensure the scene is rendered from the new camera position
      renderer.render(scene, camera);
    });

    // Add orbit controls to make the object rotatable and zoomable
    const controls = new OrbitControls(camera, renderer.domElement);
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
    };
  }, [modelFileName]); // Depend on modelFileName to re-trigger loading

  return (
    <div
      ref={canvasRef}
      style={{ width: "500px", height: "500px", margin: "auto" }}
    />
  );
};

export default ThreeCanvas;
