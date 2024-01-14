import { useEffect, useRef, useState } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import * as OBC from 'openbim-components';

export default function Home() {

    const mountRef = useRef(null);
    const [rendererVar, setRendererVar] = useState()
    const [cameraVar, setCameraVar] = useState()
    const [sceneVar, setSceneVar] = useState()

    useEffect(() => {
        var container, camera, renderer, scene, controls

        init();
        render();

        function init() {
            container = document.createElement('div');
            scene = new THREE.Scene()
            setSceneVar(scene)
            scene.background = new THREE.Color(0x8cc7de);

            // Camera
            camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 100000);
            setCameraVar(camera)
            camera.position.set(60, 40, 60);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            //Lights
            const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
            directionalLight1.position.set(1, 1, 1);
            scene.add(directionalLight1);
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight2.position.set(- 1, 0.5, - 1);
            scene.add(directionalLight2);
            const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);
            scene.add(ambientLight);

            // Cube
            const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
            const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(0, 0, 0);
            scene.add(cube);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            setRendererVar(renderer)
            renderer.setClearColor(scene.background.color);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.localClippingEnabled = true;

            mountRef.current.appendChild(renderer.domElement);
            controls = new OrbitControls(camera, renderer.domElement);
            controls.update()

            window.addEventListener('resize', onWindowResize, false);
            controls.addEventListener('change', render);
        }

        function render() {
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            render()
        }

        const localRef = mountRef.current ? mountRef.current : null;
        return () => localRef.removeChild(renderer.domElement);
    }, []);

    function outsideRender() {
        rendererVar.render(sceneVar, cameraVar);
    }

    return (
        <div ref={mountRef} />
    )
}