import {default as db} from '../db/db.js';

await db.init();
let allEditions = await db.RepoBranchSchema.find({}).lean();
let migrated = 0;
let failed = 0;
let succeeded = 0;
let alreadyMoved = 0;
for (let i=0; i<allEditions.length; i++){
    process.stdout.write("Progress: " + ((migrated++/allEditions.length)*100).toFixed(1) + "%\r");

    if (typeof(allEditions[i].more_information) === 'string'){
        
        let r = allEditions[i];
            try{
                r.more_information = {
                    url: r.more_information
                }
                await db.RepoBranchSchema.updateOne({_id: r._id}, r);
                succeeded++;
            }catch(e){
                failed++;
            }
        
    }else{
        alreadyMoved++;
    }
}

process.stdout.write("Done migration migrated: " + succeeded + " failed: " + failed + " skipped (no more_information): " + alreadyMoved + " total: " + allEditions.length);
console.log("\n");
process.exit(0);