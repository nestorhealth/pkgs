import { evaluate } from "fhirpath";
import _R4Model from "fhirpath/fhir-context/r4";
import { Array, Data, HashSet, Match, pipe } from "effect";
import { isPrimitiveType } from "../typecheck";
import { hd, removeHd, joinPaths } from "./path";
export const R4Model = _R4Model;
export const CHOICE_PATHS = Object.keys(R4Model.choiceTypePaths);
export const ALL_PATHS = Object.keys(R4Model.path2Type);
const PathFHIRTypeEntries = Object.entries(R4Model.path2Type);
export function evaluateSync(data, pathexpr) {
    return evaluate(data, pathexpr, undefined, R4Model);
}
const resolve = (pathRelation) => `${pathRelation.parent}.${removeHd(pathRelation.path)}`;
export function normalizePathRelations(pathRelations, rootPath) {
    return HashSet.reduce(pathRelations, [], (acc, pathRelation) => Match.value(pathRelation.parent).pipe(Match.when(rootPath, _ => Array.append(acc, resolve(pathRelation))), Match.orElse(_ => pipe(resolve(pathRelation), (resolvedPath) => ({ path: resolvedPath, parent: rootPath }), resolve, resolved => Array.append(acc, resolved)))));
}
export function flatLeaves(fhirType, parentPath) {
    const make = (path, parent) => Data.struct({ path, parent });
    return pipe(PathFHIRTypeEntries, Array.filter(([path]) => hd(path) === fhirType), Array.reduce(HashSet.empty(), (acc, [path, childType]) => Match.value(childType).pipe(Match.when(isPrimitiveType, _ => HashSet.add(acc, make(path, parentPath))), Match.when("Extension", _ => acc), Match.orElse((complexType) => pipe(flatLeaves(complexType, path), (childSet) => HashSet.union(acc, childSet))))));
}
export function isValidPath(path, resourceType) {
    const joined = joinPaths(resourceType, path);
    return R4Model.path2Type[joined] !== undefined;
}
