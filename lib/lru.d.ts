declare class LRU<T = any> {
    private first;
    private items;
    private last;
    private max;
    private size;
    private ttl;
    constructor(max?: number, ttl?: number);
    has(key: string): boolean;
    clear(): this;
    delete(key: string): this;
    evict(): this;
    get(key: string): T;
    keys(): string[];
    set(key: string, value: T, bypass?: boolean): this;
}
export default function factory(max?: number, ttl?: number): LRU<any>;
export {};
