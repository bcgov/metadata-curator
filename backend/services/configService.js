const db = require('../db/db');
const mongoose = require('mongoose');
const { config } = require('chai');

const createConfig = async function(key, value) {
    const configSchema = new db.ConfigSchema;
    configSchema.key = key;
    configSchema.value = value;

    return await configSchema.save();
}

const getConfigs = async function(){
    var q = {};
    return await db.ConfigSchema.find(q);
}

const updateConfig = async function(key, value) {
    let configSchema = await db.ConfigSchema.findOne({key: key});
    console.log("configS", configSchema);
    configSchema.value = value;
    console.log("configS2", configSchema);
    
    return await configSchema.save();
}

const getConfig = async function(key){
    try {
        return await db.ConfigSchema.findOne({key: key});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const deleteConfig = async (key) => {
    return await db.ConfigSchema.deleteOne({key: key});
}

module.exports = {
    createConfig,
    updateConfig,
    getConfigs,
    getConfig,
    deleteConfig
}
