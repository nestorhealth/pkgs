import { evaluate, Model } from "fhirpath";
import { ComplexType, ResourceType } from "../types";
import { FHIRType } from "@/pkgs/fhir-effect/types";
import _R4Model from "fhirpath/fhir-context/r4";
import { Stringh } from "@/lib/next-h/string";
import { Array, Data, HashSet, Match, Option, pipe, Record, String } from "effect";
import { isPrimitiveType, isResourceType } from "../typecheck";
import { nthExn, splitPath, parent, hd, lastExn, removeHd, joinPaths } from "./path";

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

export function* genpath(parent: ResourceType) {
  // Set first next() to be identity
  yield [parent];
  
  // Get child paths
  const l1 = ALL_PATHS.filter(path => hd(path) === parent && splitPath(path).length === 2);
  yield l1;
}

class FHIRPathError extends Error {}

export const rootExn = (path: string): ResourceType => pipe(
  hd(path),
  Option.liftPredicate(isResourceType),
  Option.getOrThrow
);

export function getLevelPath(path: string, levelInt: number) {
  if (levelInt % 1 !== 0) {
    throw new FHIRPathError("Must pass an integer level.");
  }
  const split = splitPath(path);
  if (split.length < levelInt) {
    return undefined;
  }
  return splitPath(path)[levelInt];
}

export function typeOf(path: string): FHIRType | null {
  return R4Model.path2Type[path] ?? null;
}

type PathNode =
  | {
      path: string;
      type: FHIRType;
    }
  | { path: null; type: null };
export function lastComplexNodeOf(path: string): PathNode {
  // Check first type in case the path itself is a complex type
  const firstType = typeOf(path);
  if (firstType) {
    return {
      path: path,
      type: firstType,
    };
  }

  let lastComplexPath = {
    path: path,
    type: hd(path) as FHIRType
  };
  const pathSplit = splitPath(path);
  for (let i = 1; i < pathSplit.length; i++) {
    const parentPath = nthExn(lastComplexPath.path, i);
    const joined = joinPaths(parentPath, pathSplit[i]);
    const pathType = typeOf(joined);
    if (
      pathType &&
      pathType !== "BackboneElement" &&
      !isPrimitiveType(pathType)
    ) {
      lastComplexPath = {
        path: joined,
        type: pathType
      };
    }
  }

  return lastComplexPath;
}

export function trailingTypeOf(path: string): FHIRType | null {
  const firstType = typeOf(path);
  if (firstType) {
    return firstType;
  }

  let lastType = hd(path) as FHIRType;
  const pathSplit = splitPath(path);
  for (let i = 1; i < pathSplit.length; i++) {
    const parentPath = nthExn(lastType, i);
    const joined = joinPaths(parentPath, pathSplit[i]);
    const pathType = typeOf(joined);
    if (pathType && pathType !== "BackboneElement") {
      lastType = pathType;
    }
  }

  return lastType;
}

export function next(path: string) {
  const valueOptions = CHOICE_PATHS.filter((path2) => path2.includes(path));
  const nextLevel = ALL_PATHS.filter(
    (path2) => path2.includes(path) && path2 !== path,
  );
  return pipe(
    nextLevel.map((path) => {
      if (valueOptions.some((polymorphic) => path.includes(polymorphic))) {
        return normalizePolymorphicPath(path);
      }
      return path;
    }),
    Array.dedupe
  );
}
export function hasNextLevel(path: string) {
  return next(path).length > 1;
}

export function normalizePolymorphicPath(path: string) {
  const tail = lastExn(path);
  const idx = Stringh.findChari(tail, (c) => c.toUpperCase() === c);
  const normalized = tail.substring(0, idx);
  return joinPaths(parent(path), normalized);
}

export function isValidPath(path: string, resourceType: ResourceType) {
  const joined = joinPaths(resourceType, path);
  return R4Model.path2Type[joined] !== undefined;
}
