import { IFCLoader } from "web-ifc-three/IFCLoader";
//import { IFCLoader } from "three/examples/jsm/loaders/IFCLoader";
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Home() {
    const mountRef = useRef(null);

    useEffect(() => {
        let scene, camera, renderer;

        init();

        function init() {
            //Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x8cc7de);

            //Camera
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = - 70;
            camera.position.y = 25;
            camera.position.x = 90;

            //Lights
            const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
            directionalLight1.position.set(1, 1, 1);
            scene.add(directionalLight1);
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight2.position.set(- 1, 0.5, - 1);
            scene.add(directionalLight2);
            const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);
            scene.add(ambientLight);

            //Setup IFC Loader
            const ifcLoader = new IFCLoader();
            ifcLoader.ifcManager.setWasmPath('../../../../');
            ifcLoader.load('example.ifc', function (model) {
                const mesh = model.mesh
                model.geometry.center()
                scene.add(mesh);
                render();
            });

            //Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            mountRef.current?.appendChild(renderer.domElement);

            // Clipping planes (this is so you can see the inside of teh building)
            const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)
            renderer.clippingPlanes = [plane]

            //Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener('change', render);
            window.addEventListener('resize', onWindowResize);
            render();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }
        const localRef = mountRef.current ? mountRef.current : null;
        return () => localRef?.removeChild(renderer.domElement);
    }, [])

    return (
        <div ref={mountRef} />
    )
}
