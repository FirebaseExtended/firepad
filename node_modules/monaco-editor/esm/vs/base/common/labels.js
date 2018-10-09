/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import URI from './uri.js';
import { normalize, basename as pathsBasename, sep } from './paths.js';
import { ltrim, startsWithIgnoreCase, rtrim, startsWith } from './strings.js';
import { Schemas } from './network.js';
import { isLinux, isWindows } from './platform.js';
import { isEqual } from './resources.js';
/**
 * @deprecated use UriLabelService instead
 */
export function getPathLabel(resource, userHomeProvider, rootProvider) {
    if (!resource) {
        return null;
    }
    if (typeof resource === 'string') {
        resource = URI.file(resource);
    }
    // return early if we can resolve a relative path label from the root
    var baseResource = rootProvider ? rootProvider.getWorkspaceFolder(resource) : null;
    if (baseResource) {
        var hasMultipleRoots = rootProvider.getWorkspace().folders.length > 1;
        var pathLabel = void 0;
        if (isEqual(baseResource.uri, resource, !isLinux)) {
            pathLabel = ''; // no label if paths are identical
        }
        else {
            pathLabel = normalize(ltrim(resource.path.substr(baseResource.uri.path.length), sep), true);
        }
        if (hasMultipleRoots) {
            var rootName = (baseResource && baseResource.name) ? baseResource.name : pathsBasename(baseResource.uri.fsPath);
            pathLabel = pathLabel ? (rootName + ' • ' + pathLabel) : rootName; // always show root basename if there are multiple
        }
        return pathLabel;
    }
    // return if the resource is neither file:// nor untitled:// and no baseResource was provided
    if (resource.scheme !== Schemas.file && resource.scheme !== Schemas.untitled) {
        return resource.with({ query: null, fragment: null }).toString(true);
    }
    // convert c:\something => C:\something
    if (hasDriveLetter(resource.fsPath)) {
        return normalize(normalizeDriveLetter(resource.fsPath), true);
    }
    // normalize and tildify (macOS, Linux only)
    var res = normalize(resource.fsPath, true);
    if (!isWindows && userHomeProvider) {
        res = tildify(res, userHomeProvider.userHome);
    }
    return res;
}
export function getBaseLabel(resource) {
    if (!resource) {
        return null;
    }
    if (typeof resource === 'string') {
        resource = URI.file(resource);
    }
    var base = pathsBasename(resource.path) || (resource.scheme === Schemas.file ? resource.fsPath : resource.path) /* can be empty string if '/' is passed in */;
    // convert c: => C:
    if (hasDriveLetter(base)) {
        return normalizeDriveLetter(base);
    }
    return base;
}
function hasDriveLetter(path) {
    return isWindows && path && path[1] === ':';
}
export function normalizeDriveLetter(path) {
    if (hasDriveLetter(path)) {
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
    return path;
}
var normalizedUserHomeCached = Object.create(null);
export function tildify(path, userHome) {
    if (isWindows || !path || !userHome) {
        return path; // unsupported
    }
    // Keep a normalized user home path as cache to prevent accumulated string creation
    var normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : void 0;
    if (!normalizedUserHome) {
        normalizedUserHome = "" + rtrim(userHome, sep) + sep;
        normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
    }
    // Linux: case sensitive, macOS: case insensitive
    if (isLinux ? startsWith(path, normalizedUserHome) : startsWithIgnoreCase(path, normalizedUserHome)) {
        path = "~/" + path.substr(normalizedUserHome.length);
    }
    return path;
}
