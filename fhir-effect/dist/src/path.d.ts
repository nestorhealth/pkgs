import { Option } from "effect";
export declare const split: (path: string) => [string, ...string[]];
export declare const parent: (path: string) => string;
export declare function last(path: string): Option.Option<string>;
export declare const lastExn: (path: string) => string;
export declare const hd: (path: string) => string;
export declare const removeHd: (path: string) => string;
export declare const removeLast: (path: string) => string;
export declare const length: (path: string) => number;
export declare function nth(path: string, n: number): Option.Option<string>;
export declare const nthExn: (path: string, n: number) => string;
export declare const joinPaths: (path1: string, path2: string) => string;
export declare function difference(path1: string, path2: string): string;
