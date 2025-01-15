import { evaluate, Model } from "fhirpath";
import { ComplexType, ResourceType, FHIRType } from "../types";
import _R4Model from "fhirpath/fhir-context/r4";
import {
  Array,
  Brand,
  Data,
  Effect,
  HashSet,
  Match,
  Option,
  pipe,
  Record,
  String,
  Tuple,
} from "effect";
import { isPrimitiveType } from "../typecheck";
import * as Path from "./path";
import * as MasterDef from "./master-def";
import * as TypeCardinality from "./type-cardinality";
import FHIREffectError, { fail } from "../error";
import { JSONSchema6 } from "json-schema";
import { path } from "d3";

interface TypedModel extends Model {
  path2Type: Record<string, FHIRType>;
}
export const R4Model: TypedModel = _R4Model as TypedModel;
export const CHOICE_PATHS: string[] = Object.keys(R4Model.choiceTypePaths);
export const ALL_PATHS = Object.keys(R4Model.path2Type);

const PathFHIRTypeEntries = Object.entries(R4Model.path2Type);

export function evaluateSync(data: unknown, pathexpr: string): any[] {
  return evaluate(data, pathexpr, undefined, R4Model) as any[];
}

export interface PathRelation {
  path: string;
  parent: string;
}

const resolve = (pathRelation: PathRelation) =>
  `${pathRelation.parent}.${Path.tl(pathRelation.path)}`;

export function normalizePathRelations(
  pathRelations: HashSet.HashSet<PathRelation>,
  rootPath: string,
): string[] {
  return HashSet.reduce(pathRelations, [] as string[], (acc, pathRelation) =>
    Match.value(pathRelation.parent).pipe(
      Match.when(rootPath, (_) => Array.append(acc, resolve(pathRelation))),
      Match.orElse((_) =>
        pipe(
          resolve(pathRelation),
          (resolvedPath) => ({ path: resolvedPath, parent: rootPath }),
          resolve,
          (resolved) => Array.append(acc, resolved),
        ),
      ),
    ),
  );
}

export function flatLeaves(
  fhirType: ComplexType,
  parentPath: string,
): HashSet.HashSet<PathRelation> {
  const make = (path: string, parent: string) =>
    Data.struct<PathRelation>({ path, parent });

  return pipe(
    PathFHIRTypeEntries,
    Array.filter(([path]) => Path.hd(path) === fhirType),
    Array.reduce(HashSet.empty<PathRelation>(), (acc, [path, childType]) =>
      Match.value(childType).pipe(
        Match.when(isPrimitiveType, (_) =>
          HashSet.add(acc, make(path, parentPath)),
        ),
        Match.when("Extension", (_) => acc),
        Match.orElse((complexType) =>
          pipe(flatLeaves(complexType, path), (childSet) =>
            HashSet.union(acc, childSet),
          ),
        ),
      ),
    ),
  );
}

export function isValidPath(path: string, resourceType: ResourceType) {
  const joined = Path.join(resourceType, path);
  return R4Model.path2Type[joined] !== undefined;
}

export function l1RefSchema(path: string) {
  const pathLength = Path.length(path);
  if (pathLength !== 2) {
    return fail(
      `Need exactly 2 path segments in l1Schema, but got ${pathLength}`,
    );
  }
  const [hd, childPath] = Path.split(path);
  return MasterDef.findSchema(hd).pipe(
    Effect.flatMap((resourceSchema) =>
      MasterDef.findPropSchemaRef(resourceSchema, childPath),
    ),
  );
}

const ResourcePropnames = ["id", "meta", "implicitRules", "language"];

const DomainResourcePropnames = [
  "text",
  "contained",
  "extension",
  "modifierExtension",
];

const unsupportedPropnames = [
  ...DomainResourcePropnames,
  ...ResourcePropnames.filter((propname) => propname !== "id"),
];
  

export const isDifferentialPropname = (key: string) =>
  key.charAt(0) !== "_" && !unsupportedPropnames.includes(key);

interface Options {
  filter: (key: string) => boolean;
}

export function children(
  path: string,
  opts: Options = { filter: isDifferentialPropname },
) {
  return MasterDef.findSchema(path).pipe(
    Effect.match({
      onFailure: (e) => {
        throw e;
      },
      onSuccess: (schema) =>
        Match.value(schema).pipe(
          Match.when({ properties: Match.record }, ({ properties }) =>
            Object.keys(properties).filter(opts.filter),
          ),
          Match.orElse((schema) => {
            throw new FHIREffectError(
              `Expected an object path, but instead got ${JSON.stringify(schema, null, 2)}`,
            );
          }),
        ),
    }),
  );
}
