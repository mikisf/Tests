import * as WEBIFC from "web-ifc";
import * as FRAGS from "bim-fragment";
import { IfcItemsCategories } from "../../../ifc/ifc-categories";
import { IfcFragmentSettings } from "./ifc-fragment-settings";
import { IfcGeometries } from "./types";
import { Components } from "../../../core";
export declare class DataConverter {
    settings: IfcFragmentSettings;
    categories: IfcItemsCategories;
    components: Components;
    private _model;
    private _ifcCategories;
    private _fragmentKey;
    private _keyFragmentMap;
    private _itemKeyMap;
    private _propertyExporter;
    private readonly _spatialTree;
    constructor(components: Components);
    cleanUp(): void;
    saveIfcCategories(webIfc: WEBIFC.IfcAPI): void;
    generate(webIfc: WEBIFC.IfcAPI, geometries: IfcGeometries, civilItems: any): Promise<FRAGS.FragmentsGroup>;
    private saveModelData;
    private getBoundingBox;
    private getIfcMetadata;
    private getMetadataEntry;
    private getProjectID;
    private getCoordinationMatrix;
    private getModelProperties;
    private createAllFragments;
    private saveExpressID;
    private getFragmentsGroupData;
}