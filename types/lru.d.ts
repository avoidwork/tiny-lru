export function lru<T = any>(max?: number, ttl?: number, resetTtl?: boolean): LRU<T>;

interface LRUItem<T> {
    expiry: number;
    key: any;
    prev: LRUItem<T> | null;
    next: LRUItem<T> | null;
    value: T;
}

export class LRU<T> {
    constructor(max?: number, ttl?: number, resetTtl?: boolean);
    first: LRUItem<T> | null;
    items: Record<any, LRUItem<T>>;
    last: LRUItem<T> | null;
    max: number;
    resetTtl: boolean;
    size: number;
    ttl: number;
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
