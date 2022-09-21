export function lru(max?: number, ttl?: number): LRU;
/**
 * tiny-lru
 *
 * @copyright 2022 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 9.0.0
 */
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
