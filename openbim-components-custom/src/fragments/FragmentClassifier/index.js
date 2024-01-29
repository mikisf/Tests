import { Component, Event } from "../../base-types";
import { IfcCategoryMap, IfcPropertiesUtils } from "../../ifc";
import { toCompositeID } from "../../utils";
import { ToolComponent } from "../../core";
import { FragmentManager } from "../FragmentManager";
export class FragmentClassifier extends Component {
    constructor(components) {
        super(components);
        /** {@link Component.enabled} */
        this.enabled = true;
        this._groupSystems = {};
        /** {@link Disposable.onDisposed} */
        this.onDisposed = new Event();
        this.onFragmentsDisposed = (data) => {
            const { groupID, fragmentIDs } = data;
            for (const systemName in this._groupSystems) {
                const system = this._groupSystems[systemName];
                const groupNames = Object.keys(system);
                if (groupNames.includes(groupID)) {
                    delete system[groupID];
                    if (Object.values(system).length === 0) {
                        delete this._groupSystems[systemName];
                    }
                }
                else {
                    for (const groupName of groupNames) {
                        const group = system[groupName];
                        for (const fragmentID of fragmentIDs) {
                            delete group[fragmentID];
                        }
                        if (Object.values(group).length === 0) {
                            delete system[groupName];
                        }
                    }
                }
            }
        };
        components.tools.add(FragmentClassifier.uuid, this);
        const fragmentManager = components.tools.get(FragmentManager);
        fragmentManager.onFragmentsDisposed.add(this.onFragmentsDisposed);
    }
    /** {@link Component.get} */
    get() {
        return this._groupSystems;
    }
    async dispose() {
        this._groupSystems = {};
        const fragmentManager = this.components.tools.get(FragmentManager);
        fragmentManager.onFragmentsDisposed.remove(this.onFragmentsDisposed);
        await this.onDisposed.trigger(FragmentClassifier.uuid);
        this.onDisposed.reset();
    }
    remove(guid) {
        for (const systemName in this._groupSystems) {
            const system = this._groupSystems[systemName];
            for (const groupName in system) {
                const group = system[groupName];
                delete group[guid];
            }
        }
    }
    find(filter) {
        const fragments = this.components.tools.get(FragmentManager);
        if (!filter) {
            const result = {};
            const fragList = fragments.list;
            for (const id in fragList) {
                const fragment = fragList[id];
                const items = fragment.items;
                const hidden = Object.keys(fragment.hiddenInstances);
                result[id] = new Set(...items, ...hidden);
            }
            return result;
        }
        const size = Object.keys(filter).length;
        const models = {};
        for (const name in filter) {
            const values = filter[name];
            if (!this._groupSystems[name]) {
                console.warn(`Classification ${name} does not exist.`);
                continue;
            }
            for (const value of values) {
                const found = this._groupSystems[name][value];
                if (found) {
                    for (const guid in found) {
                        if (!models[guid]) {
                            models[guid] = {};
                        }
                        for (const id of found[guid]) {
                            if (!models[guid][id]) {
                                models[guid][id] = 1;
                            }
                            else {
                                models[guid][id]++;
                            }
                        }
                    }
                }
            }
        }
        const result = {};
        for (const guid in models) {
            const model = models[guid];
            for (const id in model) {
                const numberOfMatches = model[id];
                if (numberOfMatches === size) {
                    if (!result[guid]) {
                        result[guid] = new Set();
                    }
                    result[guid].add(id);
                    const fragment = fragments.list[guid];
                    const composites = fragment.composites[id];
                    if (composites) {
                        const idNum = parseInt(id, 10);
                        for (let i = 1; i < composites; i++) {
                            const compositeID = toCompositeID(idNum, i);
                            result[guid].add(compositeID);
                        }
                    }
                }
            }
        }
        return result;
    }
    byModel(modelID, group) {
        if (!this._groupSystems.model) {
            this._groupSystems.model = {};
        }
        const modelsClassification = this._groupSystems.model;
        if (!modelsClassification[modelID]) {
            modelsClassification[modelID] = {};
        }
        const currentModel = modelsClassification[modelID];
        for (const expressID in group.data) {
            const keys = group.data[expressID][0];
            for (const key of keys) {
                const fragID = group.keyFragments[key];
                if (!currentModel[fragID]) {
                    currentModel[fragID] = new Set();
                }
                currentModel[fragID].add(expressID);
            }
        }
    }
    byPredefinedType(group) {
        var _a;
        if (!group.properties) {
            throw new Error("To group by predefined type, properties are needed");
        }
        if (!this._groupSystems.predefinedTypes) {
            this._groupSystems.predefinedTypes = {};
        }
        const currentTypes = this._groupSystems.predefinedTypes;
        for (const expressID in group.data) {
            const entity = group.properties[parseInt(expressID, 10)];
            if (!entity)
                continue;
            const predefinedType = String((_a = entity.PredefinedType) === null || _a === void 0 ? void 0 : _a.value).toUpperCase();
            if (!currentTypes[predefinedType]) {
                currentTypes[predefinedType] = {};
            }
            const currentType = currentTypes[predefinedType];
            for (const expressID in group.data) {
                const keys = group.data[expressID][0];
                for (const key of keys) {
                    const fragmentID = group.keyFragments[key];
                    if (!currentType[fragmentID]) {
                        currentType[fragmentID] = new Set();
                    }
                    const currentFragment = currentType[fragmentID];
                    currentFragment.add(entity.expressID);
                }
            }
        }
    }
    byEntity(group) {
        if (!this._groupSystems.entities) {
            this._groupSystems.entities = {};
        }
        for (const expressID in group.data) {
            const rels = group.data[expressID][1];
            const type = rels[1];
            const entity = IfcCategoryMap[type];
            this.saveItem(group, "entities", entity, expressID);
        }
    }
    byStorey(group) {
        if (!group.properties) {
            throw new Error("To group by storey, properties are needed");
        }
        for (const expressID in group.data) {
            const rels = group.data[expressID][1];
            const storeyID = rels[0];
            const storey = group.properties[storeyID];
            if (storey === undefined)
                continue;
            const storeyName = group.properties[storeyID].Name.value;
            this.saveItem(group, "storeys", storeyName, expressID);
        }
    }
    byIfcRel(group, ifcRel, systemName) {
        const properties = group.properties;
        if (!properties)
            throw new Error("To group by IFC Rel, properties are needed");
        if (!IfcPropertiesUtils.isRel(ifcRel))
            return;
        IfcPropertiesUtils.getRelationMap(properties, ifcRel, (relatingID, relatedIDs) => {
            const { name: relatingName } = IfcPropertiesUtils.getEntityName(properties, relatingID);
            for (const expressID of relatedIDs) {
                this.saveItem(group, systemName, relatingName !== null && relatingName !== void 0 ? relatingName : "NO REL NAME", String(expressID));
            }
        });
    }
    saveItem(group, systemName, className, expressID) {
        if (!this._groupSystems[systemName]) {
            this._groupSystems[systemName] = {};
        }
        const keys = group.data[expressID];
        if (!keys)
            return;
        for (const key of keys[0]) {
            const fragmentID = group.keyFragments[key];
            if (fragmentID) {
                const system = this._groupSystems[systemName];
                if (!system[className]) {
                    system[className] = {};
                }
                if (!system[className][fragmentID]) {
                    system[className][fragmentID] = new Set();
                }
                system[className][fragmentID].add(expressID);
            }
        }
    }
}
FragmentClassifier.uuid = "e25a7f3c-46c4-4a14-9d3d-5115f24ebeb7";
ToolComponent.libraryUUIDs.add(FragmentClassifier.uuid);
//# sourceMappingURL=index.js.map