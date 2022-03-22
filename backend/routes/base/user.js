var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, cache){
    const mongoose = require('mongoose');

    const util = require('./util');
    const requiredPhase = 3;

    router.put('/:email', auth.requireLoggedIn, async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', 'user'));
        }
        try{

            if (req.params.email !== req.user.email){
                res.status(403).json({error: "Email is not yours, access denied"});
            }

            let existing = await db.User.findOne({email: req.params.email});

            if ( ( (req.body.bcdc_apiKey) && (!req.body.bcdc_accessKey) ) || ( (!req.body.bcdc_apiKey) && (req.body.bcdc_accessKey) ) ){
                return res.status(400).json({error: "To set either api key or access key both must be defined"});
            }

            if (req.body.bcdc_apiKey){
                var CryptoJS = require("crypto-js");
                // Encrypt
                
                // Decrypt
                //var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
                var ciphertext = CryptoJS.AES.encrypt(req.body.bcdc_apiKey, req.body.bcdc_accessKey.toString());
                existing.bcdc_apiKey = ciphertext;

                var md5 = require('md5'); 
                existing.bcdc_accessKey = md5(req.body.bcdc_accessKey);
            }
            
            await existing.save();

            delete existing.bcdc_apiKey;
            delete existing.bcdc_accessKey;
            
            res.status(200).json(existing);
        }catch(ex){
            console.log("ex", ex);
            res.status(500).json(ex);
        }
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};