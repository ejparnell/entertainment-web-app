import { omdbCacheUtils } from '@/services/omdbService';
import { mlCacheUtils } from '@/services/mlServices';

export const cacheManager = {
    clearAll: () => {
        omdbCacheUtils.clearCache();
        mlCacheUtils.clearCache();
    },

    getAllStats: () => {
        return {
            omdb: omdbCacheUtils.getStats(),
            ml: mlCacheUtils.getStats(),
            sizes: {
                omdb: omdbCacheUtils.getCacheSize(),
                ml: mlCacheUtils.getCacheSize()
            }
        };
    },

    getTotalSize: () => {
        const omdbSize = omdbCacheUtils.getCacheSize();
        const mlSize = mlCacheUtils.getCacheSize();
        
        return {
            omdb: omdbSize.omdb + omdbSize.batch,
            ml: mlSize.recommendations + mlSize.topShows,
            total: omdbSize.omdb + omdbSize.batch + mlSize.recommendations + mlSize.topShows
        };
    },

    logPerformanceSummary: () => {
        const stats = cacheManager.getAllStats();
        const sizes = cacheManager.getTotalSize();
        
        console.log('🗂️ Cache Performance Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 OMDB Cache: ${stats.omdb.valid} valid, ${stats.omdb.expired} expired`);
        console.log(`📊 ML Recommendations: ${stats.ml.recommendations.valid} valid, ${stats.ml.recommendations.expired} expired`);
        console.log(`📊 ML Top Shows: ${stats.ml.topShows.valid} valid, ${stats.ml.topShows.expired} expired`);
        console.log(`📈 Total cached entries: ${sizes.total}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
};


if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            cacheManager.getAllStats();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (process.env.NODE_ENV === 'development') {
            cacheManager.logPerformanceSummary();
        }
    });
}

export default cacheManager;