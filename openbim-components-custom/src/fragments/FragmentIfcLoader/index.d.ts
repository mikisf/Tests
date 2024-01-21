import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "bim-fragment";
import { Disposable, Event, UI, Component, UIElement, Configurable } from "../../base-types";
import { Button, ToastNotification } from "../../ui";
import { Components } from "../../core";
export * from "./src/types";
export interface FragmentIfcLoaderConfig {
    autoSetWasm: boolean;
}
/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment). It can also return the
 * properties as a JSON file, as well as other sets of information within
 * the IFC file.
 */
export declare class FragmentIfcLoader extends Component<WEBIFC.IfcAPI> implements Disposable, UI, Configurable<FragmentIfcLoaderConfig> {
    static readonly uuid: "a659add7-1418-4771-a0d6-7d4d438e4624";
    /** {@link Disposable.onDisposed} */
    readonly onDisposed: Event<string>;
    enabled: boolean;
    uiElement: UIElement<{
        main: Button;
        toast: ToastNotification;
    }>;
    onIfcLoaded: Event<FragmentsGroup>;
    config: Required<FragmentIfcLoaderConfig>;
    readonly onSetup: Event<FragmentIfcLoader>;
    onLocationsSaved: Event<{
        [id: number]: number[];
    }>;
    private _webIfc;
    private readonly _geometry;
    private readonly _converter;
    constructor(components: Components);
    private autoSetWasm;
    setup(config?: Partial<FragmentIfcLoaderConfig>): Promise<void>;
    get(): WEBIFC.IfcAPI;
    get settings(): import("./src").IfcFragmentSettings;
    /** {@link Disposable.dispose} */
    dispose(): Promise<void>;
    /** Loads the IFC file and converts it to a set of fragments. */
    load(data: Uint8Array, name: string): Promise<FragmentsGroup>;
    private setupUI;
    readIfcFile(data: Uint8Array): Promise<number>;
    private readAllGeometries;
    cleanIfcApi(): void;
    private cleanUp;
    private isExcluded;
}
