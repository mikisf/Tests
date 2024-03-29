import * as THREE from "three";
import { SimpleDimensionLine } from "./src";
import { Component, Event, UIElement, } from "../../base-types";
import { SimpleRaycaster, ToolComponent } from "../../core";
import { Button } from "../../ui";
import { VertexPicker } from "../../utils";
export * from "./src";
/**
 * A basic dimension tool to measure distances between 2 points in 3D and
 * display a 3D symbol displaying the numeric value.
 */
export class LengthMeasurement extends Component {
    /** {@link Component.enabled} */
    get enabled() {
        return this._enabled;
    }
    /** {@link Component.enabled} */
    set enabled(value) {
        if (!value)
            this.cancelCreation();
        this._enabled = value;
        this._vertexPicker.enabled = value;
        if (this.components.uiEnabled) {
            const main = this.uiElement.get("main");
            main.active = value;
        }
    }
    /** {@link Hideable.visible} */
    get visible() {
        return this._visible;
    }
    /** {@link Hideable.visible} */
    set visible(value) {
        this._visible = value;
        if (!this._visible) {
            this.enabled = false;
        }
        for (const dimension of this._measurements) {
            dimension.visible = this._visible;
        }
    }
    /**
     * The [Color](https://threejs.org/docs/#api/en/math/Color)
     * of the geometry of the dimensions.
     */
    set color(color) {
        this._lineMaterial.color = color;
    }
    constructor(components) {
        super(components);
        /** {@link Disposable.onDisposed} */
        this.onDisposed = new Event();
        /** {@link Updateable.onBeforeUpdate} */
        this.onBeforeUpdate = new Event();
        /** {@link Updateable.onAfterUpdate} */
        this.onAfterUpdate = new Event();
        /** {@link Createable.onAfterCreate} */
        this.onAfterCreate = new Event();
        /** {@link Createable.onBeforeCreate} */
        this.onBeforeCreate = new Event();
        /** {@link Createable.onAfterDelete} */
        this.onAfterDelete = new Event();
        /** {@link Createable.onBeforeDelete} */
        this.onBeforeDelete = new Event();
        /** {@link Createable.onBeforeCancel} */
        this.onBeforeCancel = new Event();
        /** {@link Createable.onAfterCancel} */
        this.onAfterCancel = new Event();
        this.uiElement = new UIElement();
        /** The minimum distance to force the dimension cursor to a vertex. */
        this.snapDistance = 0.25;
        this._lineMaterial = new THREE.LineBasicMaterial({
            color: "#DC2626",
            linewidth: 2,
            depthTest: false,
        });
        this._measurements = [];
        this._visible = true;
        this._enabled = false;
        /** Temporary variables for internal operations */
        this._temp = {
            isDragging: false,
            start: new THREE.Vector3(),
            end: new THREE.Vector3(),
            dimension: undefined,
        };
        /**
         * Starts or finishes drawing a new dimension line.
         *
         * @param data - forces the dimension to be drawn on a plane. Use this if you are drawing
         * dimensions in floor plan navigation.
         */
        this.create = async (data) => {
            const plane = data instanceof THREE.Object3D ? data : undefined;
            if (!this._enabled)
                return;
            await this.onBeforeCreate.trigger(this);
            if (!this._temp.isDragging) {
                this.drawStart(plane);
                return;
            }
            await this.endCreation();
        };
        this.onKeyDown = (e) => {
            if (!this.enabled)
                return;
            if (e.key === "Escape") {
                if (this._temp.isDragging) {
                    this.cancelCreation();
                }
                else {
                    this.enabled = false;
                }
            }
        };
        this.components.tools.add(LengthMeasurement.uuid, this);
        this._raycaster = new SimpleRaycaster(this.components);
        this._vertexPicker = new VertexPicker(components, {
            previewElement: this.newEndpoint(),
            snapDistance: this.snapDistance,
        });
        if (components.uiEnabled) {
            this.setUI();
        }
    }
    setUI() {
        const main = new Button(this.components);
        this.uiElement.set({ main });
        main.materialIcon = "straighten";
        main.onClick.add(() => {
            if (!this.enabled) {
                this.setupEvents(true);
                main.active = true;
                this.enabled = true;
            }
            else {
                this.enabled = false;
                main.active = false;
                this.setupEvents(false);
            }
        });
    }
    /** {@link Component.get} */
    get() {
        return this._measurements;
    }
    /** {@link Disposable.dispose} */
    async dispose() {
        this.setupEvents(false);
        this.enabled = false;
        this.onBeforeUpdate.reset();
        this.onAfterUpdate.reset();
        this.onBeforeCreate.reset();
        this.onAfterCreate.reset();
        this.onBeforeDelete.reset();
        this.onAfterDelete.reset();
        this.onBeforeCancel.reset();
        this.onAfterCancel.reset();
        this.uiElement.dispose();
        if (this.previewElement) {
            this.previewElement.remove();
        }
        for (const measure of this._measurements) {
            await measure.dispose();
        }
        this._lineMaterial.dispose();
        this._measurements = [];
        await this._vertexPicker.dispose();
        await this.onDisposed.trigger(LengthMeasurement.uuid);
        this.onDisposed.reset();
    }
    /** {@link Updateable.update} */
    async update(_delta) {
        if (this._enabled) {
            await this.onBeforeUpdate.trigger(this);
            if (this._temp.isDragging) {
                this.drawInProcess();
            }
            await this.onAfterUpdate.trigger(this);
        }
    }
    /** Deletes the dimension that the user is hovering over with the mouse or touch event. */
    async delete() {
        if (!this._enabled || this._measurements.length === 0)
            return;
        const boundingBoxes = this.getBoundingBoxes();
        const intersect = this._raycaster.castRay(boundingBoxes);
        if (!intersect)
            return;
        const dimension = this._measurements.find((dim) => dim.boundingBox === intersect.object);
        if (dimension) {
            const index = this._measurements.indexOf(dimension);
            this._measurements.splice(index, 1);
            await dimension.dispose();
            await this.onAfterDelete.trigger(this);
        }
    }
    async deleteMeasurement(measurement) {
        if (measurement) {
            const index = this._measurements.indexOf(measurement);
            this._measurements.splice(index, 1);
            await measurement.dispose();
            await this.onAfterDelete.trigger(this);
        }
    }
    /** Deletes all the dimensions that have been previously created. */
    async deleteAll() {
        for (const dim of this._measurements) {
            await dim.dispose();
            await this.onAfterDelete.trigger(this);
        }
        this._measurements = [];
    }
    /** Cancels the drawing of the current dimension. */
    cancelCreation() {
        var _a;
        if (!this._temp.dimension)
            return;
        this._temp.isDragging = false;
        (_a = this._temp.dimension) === null || _a === void 0 ? void 0 : _a.dispose();
        this._temp.dimension = undefined;
    }
    drawStart(plane) {
        const items = plane ? [plane] : undefined;
        const intersects = this._raycaster.castRay(items);
        const point = this._vertexPicker.get();
        if (!(intersects && point))
            return;
        this._temp.isDragging = true;
        this._temp.start = plane ? intersects.point : point;
    }
    drawInProcess() {
        const intersects = this._raycaster.castRay();
        if (!intersects)
            return;
        const found = this._vertexPicker.get();
        if (!found)
            return;
        this._temp.end = found;
        if (!this._temp.dimension) {
            this._temp.dimension = this.drawDimension();
        }
        this._temp.dimension.endPoint = this._temp.end;
    }
    async endCreation() {
        if (!this._temp.dimension)
            return;
        this._temp.dimension.createBoundingBox();
        this._measurements.push(this._temp.dimension);
        await this.onAfterCreate.trigger(this._temp.dimension);
        this._temp.dimension = undefined;
        this._temp.isDragging = false;
    }
    drawDimension() {
        return new SimpleDimensionLine(this.components, {
            start: this._temp.start,
            end: this._temp.end,
            lineMaterial: this._lineMaterial,
            endpointElement: this.newEndpoint(),
        });
    }
    newEndpoint() {
        const element = document.createElement("div");
        element.className = "w-2 h-2 bg-red-600 rounded-full";
        return element;
    }
    getBoundingBoxes() {
        return this._measurements
            .map((dim) => dim.boundingBox)
            .filter((box) => box !== undefined);
    }
    setupEvents(active) {
        const viewerContainer = this.components.renderer.get().domElement.parentElement;
        if (!viewerContainer)
            return;
        if (active) {
            viewerContainer.addEventListener("click", this.create);
            window.addEventListener("keydown", this.onKeyDown);
        }
        else {
            viewerContainer.removeEventListener("click", this.create);
            window.removeEventListener("keydown", this.onKeyDown);
        }
    }
}
LengthMeasurement.uuid = "2f9bcacf-18a9-4be6-a293-e898eae64ea1";
ToolComponent.libraryUUIDs.add(LengthMeasurement.uuid);
//# sourceMappingURL=index.js.map