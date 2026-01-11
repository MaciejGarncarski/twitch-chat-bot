import { pl } from "@/i18n/locales/pl"

export type Language = "en" | "pl"

type BaseTranslationSchema = typeof pl

type ReplaceLeaf<T, Leaf> = T extends string
  ? Leaf
  : {
      [K in keyof T]: ReplaceLeaf<T[K], Leaf>
    }

export type TranslationSchema = ReplaceLeaf<BaseTranslationSchema, string>

export type TKey = NestedPaths<BaseTranslationSchema>

type NestedPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${NestedPaths<T[K]>}`
    }[keyof T & string]

export type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

type ExtractParams<S> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractParams<Rest>
  : never

export type TranslationParams<K extends TKey> =
  PathValue<BaseTranslationSchema, K> extends string
    ? ExtractParams<PathValue<BaseTranslationSchema, K>> extends never
      ? Record<never, never> | undefined
      : Record<ExtractParams<PathValue<BaseTranslationSchema, K>>, string | number>
    : never
