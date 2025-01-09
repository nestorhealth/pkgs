import { evaluate, Model } from "fhirpath";
import { ComplexType, ResourceType, FHIRType } from "../types";
import _R4Model from "fhirpath/fhir-context/r4";
import { Array, Data, HashSet, Match, pipe, Record } from "effect";
import { isPrimitiveType } from "../typecheck";
import { hd, removeHd, joinPaths } from "./path";

interface TypedModel extends Model {
  path2Type: Record<string, FHIRType>;
}
export const R4Model: TypedModel = _R4Model as TypedModel;
export const CHOICE_PATHS: string[] = Object.keys(R4Model.choiceTypePaths);
export const ALL_PATHS = Object.keys(R4Model.path2Type);

const PathFHIRTypeEntries = Object.entries(R4Model.path2Type);

export function evaluateSync(
  data: unknown,
  pathexpr: string,
): any[] {
  return evaluate(data, pathexpr, undefined, R4Model) as any[];
}

export interface PathRelation {
  path: string;
  parent: string;
}

const resolve = (pathRelation: PathRelation) => `${pathRelation.parent}.${removeHd(pathRelation.path)}`;

export function normalizePathRelations(pathRelations: HashSet.HashSet<PathRelation>, rootPath: string): string[] {
  return HashSet.reduce(pathRelations, [] as string[], 
    (acc, pathRelation) => Match.value(pathRelation.parent).pipe(
      Match.when(rootPath, _ => Array.append(acc, resolve(pathRelation))),
      Match.orElse(_ => pipe(
        resolve(pathRelation),
        (resolvedPath) => ({ path: resolvedPath, parent: rootPath }),
        resolve,
        resolved => Array.append(acc, resolved)
      ))
    )
  )
}

export function flatLeaves(fhirType: ComplexType, parentPath: string): HashSet.HashSet<PathRelation> {
  const make = (path: string, parent: string) => Data.struct<PathRelation>({ path, parent })

  return pipe(
    PathFHIRTypeEntries,
    Array.filter(([ path ]) => hd(path) === fhirType),
    Array.reduce(HashSet.empty<PathRelation>(), (acc, [ path, childType ]) => Match.value(childType).pipe(
      Match.when(isPrimitiveType, _ => HashSet.add(acc, make(path, parentPath))),
      Match.when("Extension", _ => acc),
      Match.orElse((complexType) => pipe(
        flatLeaves(complexType, path),
        (childSet) => HashSet.union(acc, childSet)
      ))
    )),
  )
}

export function isValidPath(path: string, resourceType: ResourceType) {
  const joined = joinPaths(resourceType, path);
  return R4Model.path2Type[joined] !== undefined;
}
