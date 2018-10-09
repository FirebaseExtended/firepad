import { Registry } from '../../registry/common/platform.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Extensions } from './configurationRegistry.js';
export var IConfigurationService = createDecorator('configurationService');
export var ConfigurationTarget;
(function (ConfigurationTarget) {
    ConfigurationTarget[ConfigurationTarget["USER"] = 1] = "USER";
    ConfigurationTarget[ConfigurationTarget["WORKSPACE"] = 2] = "WORKSPACE";
    ConfigurationTarget[ConfigurationTarget["WORKSPACE_FOLDER"] = 3] = "WORKSPACE_FOLDER";
    ConfigurationTarget[ConfigurationTarget["DEFAULT"] = 4] = "DEFAULT";
    ConfigurationTarget[ConfigurationTarget["MEMORY"] = 5] = "MEMORY";
})(ConfigurationTarget || (ConfigurationTarget = {}));
export function toValuesTree(properties, conflictReporter) {
    var root = Object.create(null);
    for (var key in properties) {
        addToValueTree(root, key, properties[key], conflictReporter);
    }
    return root;
}
export function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
    var segments = key.split('.');
    var last = segments.pop();
    var curr = settingsTreeRoot;
    for (var i = 0; i < segments.length; i++) {
        var s = segments[i];
        var obj = curr[s];
        switch (typeof obj) {
            case 'undefined':
                obj = curr[s] = Object.create(null);
                break;
            case 'object':
                break;
            default:
                conflictReporter("Ignoring " + key + " as " + segments.slice(0, i + 1).join('.') + " is " + JSON.stringify(obj));
                return;
        }
        curr = obj;
    }
    if (typeof curr === 'object') {
        curr[last] = value; // workaround https://github.com/Microsoft/vscode/issues/13606
    }
    else {
        conflictReporter("Ignoring " + key + " as " + segments.join('.') + " is " + JSON.stringify(curr));
    }
}
export function removeFromValueTree(valueTree, key) {
    var segments = key.split('.');
    doRemoveFromValueTree(valueTree, segments);
}
function doRemoveFromValueTree(valueTree, segments) {
    var first = segments.shift();
    if (segments.length === 0) {
        // Reached last segment
        delete valueTree[first];
        return;
    }
    if (Object.keys(valueTree).indexOf(first) !== -1) {
        var value = valueTree[first];
        if (typeof value === 'object' && !Array.isArray(value)) {
            doRemoveFromValueTree(value, segments);
            if (Object.keys(value).length === 0) {
                delete valueTree[first];
            }
        }
    }
}
/**
 * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
 */
export function getConfigurationValue(config, settingPath, defaultValue) {
    function accessSetting(config, path) {
        var current = config;
        for (var i = 0; i < path.length; i++) {
            if (typeof current !== 'object' || current === null) {
                return undefined;
            }
            current = current[path[i]];
        }
        return current;
    }
    var path = settingPath.split('.');
    var result = accessSetting(config, path);
    return typeof result === 'undefined' ? defaultValue : result;
}
export function getConfigurationKeys() {
    var properties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    return Object.keys(properties);
}
export function getDefaultValues() {
    var valueTreeRoot = Object.create(null);
    var properties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    for (var key in properties) {
        var value = properties[key].default;
        addToValueTree(valueTreeRoot, key, value, function (message) { return console.error("Conflict in default settings: " + message); });
    }
    return valueTreeRoot;
}
export function overrideIdentifierFromKey(key) {
    return key.substring(1, key.length - 1);
}
