import { IFCLoader } from "web-ifc-three/IFCLoader";
//import { IFCLoader } from "three/examples/jsm/loaders/IFCLoader";
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IFCSITE, IFCWALLSTANDARDCASE, IFCSLAB, IFCDOOR, IFCWINDOW, IFCFURNISHINGELEMENT, IFCMEMBER, IFCPLATE } from "web-ifc";

export default function Home() {
    const mountRef = useRef(null);
    const [subsets, setSubsets] = useState({})
    const [ifcLoaderVar, setIfcLoaderVar] = useState()
    const [rendererVar, setRendererVar] = useState()
    const [sceneVar, setScenceVar] = useState()
    const [cameraVar, setCameraVar] = useState()

    const categories = {
        IFCSITE,
        IFCWALLSTANDARDCASE,
        IFCSLAB,
        IFCFURNISHINGELEMENT,
        IFCDOOR,
        IFCWINDOW,
        IFCPLATE,
        IFCMEMBER,
    };

    async function setSubsetsAsync(ifcLoader, scene) {
        const subsetsTemp = {}
        for (let category of Object.values(categories)) {
            const ids = await ifcLoader.ifcManager.getAllItemsOfType(0, category, false);
            subsetsTemp[category] = ifcLoader.ifcManager.createSubset({
                modelID: 0,
                scene,
                ids,
                removePrevious: true,
                customID: category.toString(),
            })
        }
        setSubsets(subsetsTemp)
    }

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

            //Setup IFC Loader
            const ifcLoader = new IFCLoader();
            
            ifcLoader.ifcManager.setWasmPath('../../../../');
            ifcLoader.ifcManager.applyWebIfcConfig({
                COORDINATE_TO_ORIGIN: true,
                USE_FAST_BOOLS: false,
            });
            ifcLoader.load('example.ifc', function (model) {
                const mesh = model.mesh
                model.geometry.center()
                scene.add(mesh);
                render();

                setSubsetsAsync(ifcLoader, scene)
            });

            //Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            mountRef.current?.appendChild(renderer.domElement);

            const selectObject = async (event) => {
                if (event.button != 0) return;
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);

                const intersected = raycaster.intersectObjects(scene.children, false);
                if (intersected.length) {

                    const found = intersected[0];
                    const faceIndex = found.faceIndex;
                    const geometry = found.object.geometry;
                    const id = ifcLoader.ifcManager.getExpressId(geometry, faceIndex);

                    const modelID = found.object.modelID;

                    const props = await ifcLoader.ifcManager.getItemProperties(modelID, id, true)
                    console.log(props)
                }
            }
            
            //Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener('change', render);
            window.addEventListener('resize', onWindowResize);
            window.onpointerdown = selectObject;
            render();

            //Set variables
            setScenceVar(scene)
            setCameraVar(camera)
            setRendererVar(renderer)
            setIfcLoaderVar(ifcLoader)
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
        <>
            <div ref={mountRef} />
            <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                top: 0,
                left: 0,
            }}>
                {Object.keys(categories).map(category =>
                    <button key={category} onClick={() => {
                        const subset = subsets[categories[category]]
                        console.log(subset)
                        //subset.removeFromParent()
                        sceneVar.remove(subset)
                        console.log(subset)
                        rendererVar.render(sceneVar, cameraVar);
                    }}>{category}</button>
                )}
            </div>
        </>

    )
}