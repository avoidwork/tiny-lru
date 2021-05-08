declare function factory<T = any>(max?: number, ttl?: number): Lru<T>;

declare module "tiny-lru" {
  export default factory
}

export default factory

export class Lru<T = any> {
  constructor(max?: number, ttl?: number);

  public has(key: string): boolean;
  public get(key: string): T | undefined;
  public set(key: string, value: T, bypass?: boolean): this;
  public clear(): this;
  public delete(key: string): this;
  public evict(): this;
  public keys(): string[];
}
