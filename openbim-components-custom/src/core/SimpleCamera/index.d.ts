import * as THREE from "three";
import CameraControls from "camera-controls";
import { Component, Disposable, Updateable, Event } from "../../base-types";
import { Components } from "../Components";
/**
 * A basic camera that uses
 * [yomotsu's cameracontrols](https://github.com/yomotsu/camera-controls) to
 * easily control the camera in 2D and 3D. Check out it's API to find out
 * what features it offers.
 */
export declare class SimpleCamera extends Component<THREE.PerspectiveCamera | THREE.OrthographicCamera> implements Updateable, Disposable {
    /** {@link Updateable.onBeforeUpdate} */
    readonly onBeforeUpdate: Event<SimpleCamera>;
    /** {@link Updateable.onAfterUpdate} */
    readonly onAfterUpdate: Event<SimpleCamera>;
    readonly onAspectUpdated: Event<unknown>;
    /** {@link Disposable.onDisposed} */
    readonly onDisposed: Event<string>;
    /**
     * The object that controls the camera. An instance of
     * [yomotsu's cameracontrols](https://github.com/yomotsu/camera-controls).
     * Transforming the camera directly will have no effect: you need to use this
     * object to move, rotate, look at objects, etc.
     */
    readonly controls: CameraControls;
    /** {@link Component.enabled} */
    get enabled(): boolean;
    /** {@link Component.enabled} */
    set enabled(enabled: boolean);
    /**
     *  The camera that is being used now according to the current {@link CameraProjection}.
     */
    activeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    protected readonly _perspectiveCamera: THREE.PerspectiveCamera;
    constructor(components: Components);
    /** {@link Component.get} */
    get(): THREE.PerspectiveCamera | THREE.OrthographicCamera;
    /** {@link Disposable.dispose} */
    dispose(): Promise<void>;
    /** {@link Updateable.update} */
    update(_delta: number): Promise<void>;
    /**
     * Updates the aspect of the camera to match the size of the
     * {@link Components.renderer}.
     */
    updateAspect: () => void;
    private setupCamera;
    private setupCameraControls;
    private setupEvents;
    private static getSubsetOfThree;
}