module.exports = {
    phaseCheck: async function(cache, requiredPhase, db){
        const enabledPhaseCacheKey = 'config/enabledPhase';
        try{
            if (!cache.has(enabledPhaseCacheKey)){
                var q = {};
                const configs = await db.ConfigSchema.find(q);
                let enabledPhase = configs.find(item => item.key === 'enabledPhase');
                if (enabledPhase){
                    cache.set(enabledPhaseCacheKey, enabledPhase);
                }
            }
        

            //version check
            let ep = cache.has(enabledPhaseCacheKey) ? parseInt(cache.get(enabledPhaseCacheKey).value) : 1;
            if (ep < requiredPhase){
                return false;
            }
        }catch (ex){
            return false;
        }
        return true;
    },

    phaseText: function(method, route){
        return '<pre>Cannot '+method+' /api/v1/'+route+'</pre>';
    },

    userProjectsAccess: async function(db, user, ids, edition){
      if (typeof(edition) === 'undefined'){
        edition = false;
      }
      const projects = await db.Project.find({users: user.email});
      let s = new Set([...ids]);
      const projectKey = edition ? 'editions' : 'datasets';
      for (let i=0; i<projects.length; i++){
        for (let j=0; j<projects[i][projectKey].length; j++){
          s.add(projects[i][projectKey][j]);
        }
      }
      return Array.from(s);
    }
}