module.exports = {
    phaseCheck: function(cache, requiredPhase){
        const enabledPhaseCacheKey = 'config/enabledPhase';
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