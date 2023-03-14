export function lru<T = any>(max?: number, ttl?: number, resetTtl?: boolean): LRU<T>;
export interface LRU<T> {
    first: T | null;
    last: T | null;
    max: number;
    resetTtl: boolean;
    size: number;
    ttl: number;

    clear(): this;
    delete(key: any): this;
    evict(bypass?: boolean): this;
    expiresAt(key: any): number | undefined;
    get(key: any): T | undefined;
    keys(): string[];
    set(key: any, value: T, bypass?: boolean, resetTtl?: boolean): this;
}
export { };

