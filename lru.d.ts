export function lru<T = any>(max?: number, ttl?: number): LRU<T>;
export interface LRU<T> {
    first: T;
    items: Record<string, T>;
    last: T;
    max: number;
    size: number;
    ttl: number;
    has(key: any): boolean;
    clear(): LRU<T>;
    delete(key: any): LRU<T>;
    evict(bypass?: boolean): LRU<T>;
    get(key: any): T;
    keys(): string[];
    set(key: any, value: T, bypass?: boolean): LRU<T>;
}
export { };

