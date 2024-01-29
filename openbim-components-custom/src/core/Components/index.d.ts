import * as THREE from "three";
import { UIManager } from "../../ui";
import { BaseRenderer, Component, Disposable, Event } from "../../base-types";
import { ToolComponent } from "../ToolsComponent";
import { BaseRaycaster } from "../../base-types/base-raycaster";
/**
 * The entry point of Open BIM Components.
 * It contains the basic items to create a BIM 3D scene based on Three.js, as
 * well as all the tools provided by this library. It also manages the update
 * loop of everything. Each instance has to be initialized with {@link init}.
 *
 */
export declare class Components implements Disposable {
    /** {@link ToolComponent} */
    readonly tools: ToolComponent;
    /**
     * All the loaded [meshes](https://threejs.org/docs/#api/en/objects/Mesh).
     * This includes fragments, 3D scans, etc.
     */
    readonly meshes: THREE.Mesh[];
    /**
     * Event that fires when this instance has been fully initialized and is
     * ready to work (scene, camera and renderer are ready).
     */
    readonly onInitialized: Event<Components>;
    /** {@link Disposable.onDisposed} */
    readonly onDisposed: Event<string>;
    enabled: boolean;
    static readonly release = "1.2.0";
    /** Whether UI components should be created. */
    uiEnabled: boolean;
    private _ui?;
    private _renderer?;
    private _scene?;
    private _camera?;
    private _raycaster?;
    private _clock;
    private _needsUpdate = false;
    /** {@link UIManager} */
    set needsUpdate(needsUpdate: boolean);
    get ui(): UIManager;
    /**
     * The [Three.js renderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
     * used to render the scene. This library provides multiple renderer
     * components with pre-made functionality (e.g. rendering of 2D CSS elements.
     */
    get renderer(): BaseRenderer;
    /**
     * This needs to be initialized before calling init().
     */
    set renderer(renderer: BaseRenderer);
    /**
     * The [Three.js scene](https://threejs.org/docs/#api/en/scenes/Scene)
     * where all the rendered items are placed.
     */
    get scene(): Component<THREE.Scene>;
    /**
     * This needs to be initialized before calling init().
     */
    set scene(scene: Component<THREE.Scene>);
    /**
     * The [Three.js camera](https://threejs.org/docs/#api/en/cameras/Camera)
     * that determines the point of view of the renderer.
     */
    get camera(): Component<THREE.Camera>;
    /**
     * This needs to be initialized before calling init().
     */
    set camera(camera: Component<THREE.Camera>);
    /**
     * A component using the [Three.js raycaster](https://threejs.org/docs/#api/en/core/Raycaster)
     * used primarily to pick 3D items with the mouse or a touch screen.
     */
    get raycaster(): BaseRaycaster;
    /**
     * Although this is not necessary to make the library work, it's necessary
     * to initialize this if any component that needs a raycaster is used.
     */
    set raycaster(raycaster: BaseRaycaster);
    constructor();
    /**
     * Initializes the library. It should be called at the start of the app after
     * initializing the scene, the renderer and the
     * camera. Additionally, if any component that need a raycaster is
     * used, the {@link raycaster} will need to be initialized.
     */
    init(): Promise<void>;
    /**
     * Disposes the memory of all the components and tools of this instance of
     * the library. A memory leak will be created if:
     *
     * - An instance of the library ends up out of scope and this function isn't
     * called. This is especially relevant in Single Page Applications (React,
     * Angular, Vue, etc).
     *
     * - Any of the objects of this instance (meshes, geometries, etc) is
     * referenced by a reference type (object or array).
     *
     * You can learn more about how Three.js handles memory leaks
     * [here](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects).
     *
     */
    dispose(): Promise<void>;
    private update;
    private static update;
    private static setupBVH;
}