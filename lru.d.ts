export function lru<T = any>(max?: number, ttl?: number): LRU<T>;
export interface LRU<T> {
    first: T | null;
    last: T | null;
    max: number;
    size: number;
    ttl: number;

    clear(): this;
    delete(key: any): this;
    evict(bypass?: boolean): this;
    get(key: any): T | undefined;
    keys(): string[];
    set(key: any, value: T, bypass?: boolean): this;
}
export { };

