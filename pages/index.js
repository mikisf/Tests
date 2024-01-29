import { useEffect, useRef, useState } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import * as OBC from "../openbim-components-custom"
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { vertexShader, fragmentShader } from '../public/CustomShader';

export default function Home() {

    const mountRef = useRef(null);
    const [rendererVar, setRendererVar] = useState()
    const [cameraVar, setCameraVar] = useState()
    const [sceneVar, setSceneVar] = useState()

    useEffect(() => {

        const container = mountRef.current;

        const components = new OBC.Components();
        components.scene = new OBC.SimpleScene(components);
        components.renderer = new OBC.PostproductionRenderer(components, container);
        components.camera = new OBC.OrthoPerspectiveCamera(components);
        components.raycaster = new OBC.SimpleRaycaster(components);
        components.init();
        components.scene.setup();

        components.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);
        //const grid = new OBC.SimpleGrid(components);

        const scene = components.scene.get();
        const renderer = components.renderer.get()
        const camera = components.camera.get()

        //renderer.render(scene, camera)

        const loadIfcAsFragments2 = async () => {

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

            components.renderer.postproduction.enabled = true;
            components.renderer.postproduction.customEffects.outlineEnabled = true;

            const propsProcessor = new OBC.IfcPropertiesProcessor(components)
            propsProcessor.process(model);

            const highlighter = new OBC.FragmentHighlighter(components, fragmentIfcLoader);
            highlighter.outlinesEnabled = true;
            highlighter.setup();

            const highlightMaterial = new THREE.MeshBasicMaterial({
                color: '#BCF124',
                depthTest: false,
                opacity: 0.8,
                transparent: true
            });
            highlighter.add('default', highlightMaterial);
            highlighter.outlineMaterial.color.set(0xf0ff7a);
            highlighter.config.hoverMaterial = new THREE.MeshBasicMaterial();

            highlighter.events.select.onClear.add(() => {
                console.log()
                components.needsUpdate = true
            });
            highlighter.events.select.onHighlight.add(
                (selection) => {
                    const fragmentID = Object.keys(selection)[0];
                    const expressID = Number([...selection[fragmentID]][0]);
                    let props
                    for (const group of fragments.groups) {
                        const fragmentFound = Object.values(group.keyFragments).find(id => id === fragmentID)
                        if (fragmentFound) props = propsProcessor.getProperties(group, expressID)[0]
                    }
                    console.log(props)
                    components.needsUpdate = true
                }
            );
        }

        loadIfcAsFragments2()

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

            const getIfcCategories = async () => {

                const hider = new OBC.FragmentHider(components);
                await hider.loadCached();

                const classifier = new OBC.FragmentClassifier(components);
                classifier.byStorey(model);
                classifier.byEntity(model);
                const classifications = classifier.get();

                const classes = {};
                const classNames = Object.keys(classifications.entities);
                for (const name of classNames) {
                    classes[name] = true;
                }

                const found = classifier.find({ entities: ["IFCSITE"] });
                hider.set(false, found);
            }

            //getIfcCategories()

            scene.add(model);
        }

        //loadIfcAsFragments()

        const loadPly = () => {
            var loader = new PLYLoader();
            loader.load('bim.ply', function (geometry) {
                geometry.center()

                const material = new THREE.PointsMaterial({
                    size: 0.01,
                    /*clippingPlanes: [
                        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0).negate(),
                        new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
                    ]*/
                })
                const mesh = new THREE.Points(geometry, material)

                mesh.frustumCulled = false;
                mesh.castShadow = true;
                mesh.renderOrder = 6;

                scene.add(mesh)
                renderer.render(scene, camera)

                container.ondblclick = (event) => {
                    const raycaster = new THREE.Raycaster();
                    raycaster.params.Points.threshold = 0.05;
                    const mouse = {
                        x: (event.clientX / window.innerWidth) * 2 - 1,
                        y: - (event.clientY / window.innerHeight) * 2 + 1
                    };
                    raycaster.setFromCamera(mouse, camera);
                    var intersects = raycaster.intersectObject(mesh)
                    if (intersects.length === 0) return

                    const dotGeometry = new THREE.BufferGeometry();
                    dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(intersects[0].point, 3));
                    const dotMaterial = new THREE.PointsMaterial({
                        size: 0.1,
                        color: 0x0000ff,
                    });
                    const dot = new THREE.Points(dotGeometry, dotMaterial);

                    scene.add(dot)
                }

            })
        }

        //loadPly()

        const loadDiff = () => {
            var loader = new PLYLoader();
            loader.load('diff.ply', function (geometry) {
                geometry.center()

                const material = new THREE.ShaderMaterial({
                    vertexShader,
                    fragmentShader,
                    size: 0.01,
                    uniforms: {
                        size: { value: 1 },
                        lightDirections: { value: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)] },
                        lightIntensities: { value: [1, 1] },
                        minLightIntensity: { value: 0 }
                    },
                })
                const mesh = new THREE.Points(geometry, material)

                mesh.frustumCulled = false;
                mesh.castShadow = true;
                mesh.renderOrder = 6;

                scene.add(mesh)
                renderer.render(scene, camera)
            })
        }

        //loadDiff()

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

        //loadClippers()


    }, []);


    return (
        <div ref={mountRef} style={{
            height: '100vh',
            width: '100%'
        }} />
    )
}