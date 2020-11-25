const { configService } = require('../services')


const getConfigs = async (req, res, next) => {
    const configs = await configService.getConfigs();
    res.status(200).json(configs);
}

const getConfig = async (req, res, next) => {
    const config = await configService.getConfig(req.params.configKey);
    res.status(200).json(config);
}

const deleteConfig = async (req, res, next) => {
    await configService.deleteConfig(req.params.configKey);
    res.status(204).send();
}

const putConfig = async (req, res, next) => {
    let f = {...req.body};
    console.log("eff", f);
    const result = await configService.updateConfig(req.params.configKey, f.value);
    res.status(200).json(result);
}

const postConfig = async (req, res, next) => {
    let f = {...req.body};
    
    const config = await configService.createConfig(f.key, f.value);

    res.status(201).json(config);
}

module.exports = {
    getConfigs,
    getConfig,
    deleteConfig,
    putConfig,
    postConfig
}
