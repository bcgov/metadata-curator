module.exports = {
    phaseCheck: async function(cache, requiredPhase, db){
        try{
            const enabledPhaseCacheKey = 'config/enabledPhase';

            if (!cache.has(enabledPhaseCacheKey)){
                var q = {};
                const configs = await db.ConfigSchema.find(q);
                let enabledPhase = configs.find(item => item.key === 'enabledPhase');
                if (enabledPhase){
                    cache.set(enabledPhaseCacheKey, enabledPhase);
                }
            }
        }catch (ex){
            console.error("Phase Check error", ex);
        }

        //version check
        let ep = cache.has(enabledPhaseCacheKey) ? parseInt(cache.get(enabledPhaseCacheKey).value) : 1;
        if (ep < requiredPhase){
            return false;
        }
        return true;
    },

    phaseText: function(method, route){
        return '<pre>Cannot '+method+' /api/v1/'+route+'</pre>';
    }
}