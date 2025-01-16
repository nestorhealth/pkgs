import { Array, Effect, pipe, String } from "effect";

export function baseUrl(urlLike: string): Effect.Effect<string, Error> {
  return Effect.try(
    () => (new URL(urlLike)).hostname
  );
}

export function last(urlLike: string): Effect.Effect<string, Error> {
  return pipe(
    urlLike,
    String.split("/"),
    Array.last
  );
}
