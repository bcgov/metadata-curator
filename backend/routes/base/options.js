var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, forumClient){
    const mongoose = require('mongoose');

    router.get('/', auth.requireLoggedIn, async function(req, res, next) {

        var q = {};
        try{
            
            if (req.query.filterBy){
                q = JSON.parse(req.query.filterBy);
            }
            const options = await db.Options.find(q);

            res.status(200).json(options);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            let f = {...req.body};

            let error = [];
            if (!f.type){
                error.push("Type is required");
            }else{
                let existing = await db.Options.find({type: f.type});
                if (existing.length > 0){
                    error.push("Type must be unique");
                }
            }
            
            let option = new db.Options;
            
            let id = mongoose.Types.ObjectId();
            option.type = f.type;
            option._id = id;
            option.values = [];
            option.created_by = req.user.id;

            if (f.values){
                for (let i=0; i<f.values.length; i++){
                    let val = f.values[i];
                    if (!val.text){
                        error.push("Value " + i + " text is required");
                    }
                    if (!val.value){
                        error.push("Value " + i + " value is required");
                    }
                    option.values.push(val);
                }
            }

            if (error.length > 0){
                console.log(error);
                return res.status(400).json({error: error})
            }
    
        
            option.save();
            res.status(201).json(option);
        }catch(ex){
            console.error(ex);
            res.status(500).json(ex);
        }
    });

    router.get('/:optionId', async function(req, res, next){
        try{
            let id = mongoose.Types.ObjectId(req.params.optionId);
            let option = await db.Options.findOne({_id: id});
            
            res.status(200).json(option);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.put('/:optionId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            let f = {...req.body};
            let error = [];
            
            let option = {};

            if (f.type !== option.type){
                let existing = await db.Options.find({type: f.type});
                
                if (existing.length > 1){
                    error.push("Type must be unique");
                }else if ( (existing.length === 1) && (existing[0]._id != req.params.optionId) ){
                    error.push("Type must be unique");
                }
            }

            if (f.type){
                option.type = f.type;
            }

            if (f.values){
                option.values = [];

                for (let i=0; i<f.values.length; i++){
                    let val = f.values[i];
                    if (!val.text){
                        error.push("Value " + i + " text is required");
                    }
                    if (!val.value){
                        error.push("Value " + i + " value is required");
                    }
                    option.values.push(val);
                }
            }

            if (error.length > 0){
                return res.status(400).json({error: error})
            }
            
            let newO = await db.Options.updateOne({_id: req.params.optionId}, option);
            newO = await db.Options.findOne({key: req.params.optionId});
            res.status(200).json(newO);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.delete('/:optionId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            await db.Options.deleteOne({key: req.params.optionId});
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