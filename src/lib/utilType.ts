import { z } from 'zod';


export type Values<T> = T[keyof T];

export type Replace<T extends object, K extends keyof T, V> = Omit<T, K> & Record<K, V>;

export type OptionalField<T extends Record<string, any>, K extends keyof T> = Omit<T, K> & { [OK in K]?: T[OK] };

export type RecordToTuple<T extends Record<string, unknown>> = [keyof T, T[keyof T]][];

export type AnyTuple<T = unknown> = [] | [T, ...T[]];

export type Json = (
    { [x: string]: Json; }
    | Json[]
    | string
    | number
    | boolean
    | null
);

export type MutableArray<T extends readonly unknown[]> = [...T];

export type ReadonlyRecord<T extends Record<string, unknown>> = { readonly [K in keyof T]: T[K]; };

export type MutableRecord<T extends { readonly [K: string]: unknown; }> = { -readonly [K in keyof T]: T[K] };


export type StructuralEquality<T, U> = T extends U ? (U extends T ? true : false) : false;

export type IsCastableTo<T, U> = T extends U ?
    true : {
        [K in keyof U]: K extends keyof T ?
        IsCastableTo<T[K], U[K]> :
        never;
    }[keyof U] extends true ? true : false;

export type ZodEquivalent<Z extends z.Schema, T> = Z extends z.Schema<T> ? true : false;
