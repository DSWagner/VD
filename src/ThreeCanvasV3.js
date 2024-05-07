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

      VisualRepresentation.defaultCameraPos = new THREE.Vector3(
        bbCenter.x, 
        VisualRepresentation.config.setup.observing_elevation, 
        VisualRepresentation.config.setup.observing_distance
      );
      VisualRepresentation.camera.position.copy(VisualRepresentation.defaultCameraPos.clone());
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
  
  
  /* Adds new / removes old observers from the visualization*/
  useEffect(() => {
    observerIds.forEach((observerIdGroup, index) => {
      const activeObservers = VisualRepresentation.directions[index].map(observer => observer.id);
      const newObservers = observerIdGroup.filter(observer => !activeObservers.includes(observer));
      const obsoleteObservers = activeObservers.filter(observer => !observerIdGroup.includes(observer));

      obsoleteObservers.forEach(observerId => {
        VisualRepresentation.removeObserver(index, observerId);
      });

      newObservers.forEach(observerId => {
        VisualRepresentation.addObserver(index, observerId);
        
        if (statVizFlags[index] === true) {
          VisualRepresentation.addFixations(index, "static");
        }
      });
    });
  }, [observerIds]);

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
