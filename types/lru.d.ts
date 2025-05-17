export function lru<T = any>(max?: number, ttl?: number, resetTtl?: boolean): LRU<T>;
export class LRU<T> {
    constructor(max?: number, ttl?: number, resetTtl?: boolean);
    first: T | null;
    items: Record<any, T>;
    last: T | null;
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
    setWithEvicted(key: any, value: T, resetTtl?: boolean): T | null;
    values(keys?: any[]): T[];
}
