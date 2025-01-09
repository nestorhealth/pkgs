import { Array, Match, Option, pipe, String, Tuple } from "effect";
export const split = (path) => String.split(path, ".");
export const parent = (path) => {
    const sub = split(path);
    return sub.slice(0, split.length - 1).join(".");
};
export function last(path) {
    return pipe(path, split, Array.last);
}
export const lastExn = (path) => pipe(split(path), Array.last, Option.getOrThrow);
export const hd = (path) => split(path)[0];
export const removeHd = (path) => split(path).slice(1).join(".");
export const removeLast = (path) => path.split(".").slice(0, -1).join(".");
export const length = (path) => split(path).length - 1;
export function nth(path, n) {
    return pipe(path, split, Array.get(n));
}
export const nthExn = (path, n) => pipe(split(path), Array.unsafeGet(n));
export const joinPaths = (path1, path2) => Match.value(Tuple.make(path1, path2)).pipe(Match.when(["", ""], () => ""), Match.when(["", Match.nonEmptyString], () => path2), Match.when([Match.nonEmptyString, ""], () => path1), Match.orElse(() => `${path1}.${path2}`));
export function difference(path1, path2) {
    return pipe(path2.split("."), rhsPaths => Array.difference(path1.split("."), rhsPaths), Array.join("."));
}
