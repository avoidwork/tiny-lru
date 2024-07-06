export function lru(max?: number, ttl?: number, resetTtl?: boolean): LRU;
export class LRU {
    constructor(max?: number, ttl?: number, resetTtl?: boolean);
    first: any;
    items: any;
    last: any;
    max: number;
    resetTtl: boolean;
    size: number;
    ttl: number;
    clear(): this;
    delete(key: any): this;
    entries(keys?: any[]): any[][];
    evict(bypass?: boolean): this;
    expiresAt(key: any): any;
    get(key: any): any;
    has(key: any): boolean;
    keys(): any[];
    set(key: any, value: any, bypass?: boolean, resetTtl?: boolean): this;
    values(keys?: any[]): any[];
}
