import {default as db} from '../db/db.js';

await db.init();
let allSchemas = await db.DataPackageSchema.find({}).lean();
let migrated = 0;
let failed = 0;
let succeeded = 0;
let alreadyMoved = 0;
for (let i=0; i<allSchemas.length; i++){
    process.stdout.write("Progress: " + ((migrated++/allSchemas.length)*100).toFixed(1) + "%\r");

    let r = allSchemas[i];
    try{
        let resources = r.resources;
        for (let j=0; j<resources.length; j++){
            let fields = resources[j].tableSchema.fields;
            if (fields){
                for (let k=0; k<fields.length; k++){
                    if ( (fields[k].tags) && (!Array.isArray(fields[k].tags)) ){
                        let newTagsCommaSpace = fields[k].tags.split(', ');
                        let newTagsComma = fields[k].tags.split(',');
                        resources[j].tableSchema.fields[k].tags = (newTagsCommaSpace.length >= newTagsComma.length) ? newTagsCommaSpace : newTagsComma;
                    }
                }
            }
        }
        r.resources = resources;
        await db.DataPackageSchema.updateOne({_id: r._id}, r);
        succeeded++;
    }catch(e){
        console.log(e);
        failed++;
    }
}

process.stdout.write("Done migration migrated: " + succeeded + " failed: " + failed + " skipped (tags already array): " + alreadyMoved + " total: " + allSchemas.length);
console.log("\n");
process.exit(0);