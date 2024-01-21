import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useEffect, useRef, useState } from "react";
import { IFCSPACE } from 'web-ifc';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

export default function Home() {

    const mountRef = useRef(null);
    useEffect(() => {
        let scene, camera, renderer;

        init();

        async function init() {
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

            //PLY Loader
            var loader = new PLYLoader();
            loader.load('ONa Nube ply.ply', function (geometry) {
                geometry.center()
                const material = new THREE.PointsMaterial({
                    size: 0.01,
                })
                const mesh = new THREE.Points(geometry, material)

                mesh.frustumCulled = false;
                mesh.castShadow = true;
                mesh.renderOrder = 6;

                scene.add(mesh)
                render()
                console.log("Ply loaded")
            })

            //Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            mountRef.current?.appendChild(renderer.domElement);

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