export function lru<T = any>(max?: number, ttl?: number, resetTtl?: boolean): LRU<T>;

export interface LRUItem<T> {
    expiry: number;
    key: any;
    prev: LRUItem<T> | null;
    next: LRUItem<T> | null;
    value: T;
}

export class LRU<T = any> {
    constructor(max?: number, ttl?: number, resetTtl?: boolean);
    readonly first: LRUItem<T> | null;
    readonly items: Record<any, LRUItem<T>>;
    readonly last: LRUItem<T> | null;
    readonly max: number;
    readonly resetTtl: boolean;
    readonly size: number;
    readonly ttl: number;
    clear(): this;
    delete(key: any): this;
    entries(keys?: any[]): [any, T][];
    evict(bypass?: boolean): this;
    expiresAt(key: any): number | undefined;
    get(key: any): T | undefined;
    has(key: any): boolean;
    keys(): any[];
    set(key: any, value: T, bypass?: boolean, resetTtl?: boolean): this;
    setWithEvicted(key: any, value: T, resetTtl?: boolean): LRUItem<T> | null;
    values(keys?: any[]): T[];
}
