interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class Cache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private defaultTTL: number;

    constructor(defaultTTL: number = 5 * 60 * 1000) {
        this.defaultTTL = defaultTTL;
    }

    set(key: string, data: T, ttl?: number): void {
        const now = Date.now();
        const timeToLive = ttl ?? this.defaultTTL;
        
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + timeToLive
        });
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return false;
        }

        const now = Date.now();
        if (now > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        this.cleanExpired();
        return this.cache.size;
    }

    private cleanExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    getStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;
        
        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expired++;
            } else {
                valid++;
            }
        }

        return {
            valid,
            expired,
            total: this.cache.size
        };
    }
}

export default Cache;