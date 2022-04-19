var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, cache){
    //cache keys
    const configListCache = 'config/configs';
    const enabledPhaseCache = 'config/enabledPhase';
    const safeKeys = ['requiredRoleToCreateRequest']
    const config = require('config');

    router.get('/', async function(req, res, next) {

        let cVal = cache.get(configListCache);
        
        if (cVal !== undefined){
            return res.status(200).json(cVal)
        }
        try{
            var q = {};
            const configs = await db.ConfigSchema.find(q);
            cache.set(configListCache, configs);
            let enabledPhase = configs.find(item => item.key === 'enabledPhase');
            if (enabledPhase){
                cache.set(enabledPhaseCache, enabledPhase);
            }

            res.status(200).json(configs);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next){
        let f = {...req.body};

        let error = false;
        if (!f.key){
            error = "Key is required";
        }else if (!f.value){
            error = "Value is required";
        }

        if (error !== false){
            return res.status(400).json({error: error})
        }
        
        const configSchema = new db.ConfigSchema;
        configSchema.key = f.key;
        configSchema.value = f.value;

        try{

            let conf =  await configSchema.save();

            cache.del(configListCache)

            if (conf.key == 'enabledPhase'){
                cache.set(enabledPhaseCache, conf);
            }
        
            res.status(201).json(conf);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:configKey', async function(req, res, next){
        try{
            if (req.params.configKey === 'forumApiWS'){
                let forumApi = config.get('forumApi');
                return res.status(200).json({key: req.params.configKey, value: forumApi.wsUrl});
            }

            if (req.params.configKey === 'wsPort'){
                let wsPort = config.get('wsPort');
                return res.status(200).json({key: req.params.configKey, value: wsPort});
            }

            if (req.params.configKey === 'wsProto'){
                let wsProto = config.get('wsProto');
                return res.status(200).json({key: req.params.configKey, value: wsProto});
            }

            let conf = await db.ConfigSchema.findOne({key: req.params.configKey});
            if (!conf && safeKeys.indexOf(req.params.configKey) !== -1 && config.has(req.params.configKey)){
                conf = {key: req.params.configKey, value: config.get(req.params.configKey)};
            }
            res.status(200).json(conf);
        }catch(ex){
            console.log("config", ex);
            res.status(500).json({error: ex});
        }
    });

    router.put('/:configKey', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next){
        try{
            let f = {...req.body};
            let configSchema = await db.ConfigSchema.findOne({key: req.params.configKey});
            if (!configSchema){
                res.status(404).json({error: "No such config"});
            }
            configSchema.value = f.value;
            
            await configSchema.save();

            cache.del(configListCache);
            if (configSchema.key === "enabledPhase"){
                cache.set(enabledPhaseCache, configSchema);
            }

            res.status(200).json(configSchema);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.delete('/:configKey', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next){
        try{
            await db.ConfigSchema.deleteOne({key: req.params.configKey});
            cache.del(configListCache);
            if (req.params.configKey === "enabledPhase"){
                cache.del(enabledPhaseCache);
            }
            res.status(204).send();
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });    

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};