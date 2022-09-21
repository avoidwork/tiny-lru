export function lru(max?: number, ttl?: number): LRU;
declare class LRU {
    constructor(max?: number, ttl?: number);
    first: any;
    items: any;
    last: any;
    max: number;
    size: number;
    ttl: number;
    has(key: any): boolean;
    clear(): LRU;
    delete(key: any): LRU;
    evict(bypass?: boolean): LRU;
    get(key: any): any;
    keys(): string[];
    set(key: any, value: any, bypass?: boolean): LRU;
}
export {};
