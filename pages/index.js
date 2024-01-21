import { useEffect, useRef, useState } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import * as OBC from "../openbim-components-custom"
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

export default function Home() {

    const mountRef = useRef(null);
    const [rendererVar, setRendererVar] = useState()
    const [cameraVar, setCameraVar] = useState()
    const [sceneVar, setSceneVar] = useState()

    useEffect(() => {

        const container = mountRef.current;

        const components = new OBC.Components();
        components.scene = new OBC.SimpleScene(components);
        components.renderer = new OBC.SimpleRenderer(components, container);
        components.camera = new OBC.OrthoPerspectiveCamera(components);
        components.raycaster = new OBC.SimpleRaycaster(components);
        components.init();

        const scene = components.scene.get();
        components.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

        
        const renderer = components.renderer.get()
        const camera = components.camera.get()
        renderer.render(scene, camera)
        
        console.log(components)

        const controls = components._camera.controls
        camera.addEventListener('change', () => console.log("hello2"));
        console.log(camera)

        const grid = new OBC.SimpleGrid(components);
        
        components.scene.setup();

        async function loadIfcAsFragments() {
            let fragments = new OBC.FragmentManager(components);
            let fragmentIfcLoader = new OBC.FragmentIfcLoader(components);

            fragmentIfcLoader.settings.wasm = {
                path: "https://unpkg.com/web-ifc@0.0.46/",
                absolute: true
            }
            fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
            fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;
            const file = await fetch('../../../Revit Sant Vicenç.ifc');
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = await fragmentIfcLoader.load(buffer, "example");
            scene.add(model);
        }

        //loadIfcAsFragments()

        const loadPly = () => {
            var loader = new PLYLoader();
            loader.load('bim.ply', function (geometry) {
                geometry.center()
                const material = new THREE.PointsMaterial({
                    size: 0.01,
                })
                const mesh = new THREE.Points(geometry, material)

                mesh.frustumCulled = false;
                mesh.castShadow = true;
                mesh.renderOrder = 6;

                scene.add(mesh)
                renderer.render(scene, camera)
            })
        }

        loadPly()

        const loadClippers = () => {
            
            const clipper = new OBC.SimpleClipper(components);
            clipper.material = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2,
            })
            clipper.size = 100
            clipper.enabled = true;

            clipper.createFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -10, 0))
            clipper.createFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-10, 0, 0))
        }

        loadClippers()


    }, []);

    function outsideRender() {
        rendererVar.render(sceneVar, cameraVar);
    }

    return (
        <div ref={mountRef} style={{
            height: '100vh',
            width: '100%'
        }} />
    )
}