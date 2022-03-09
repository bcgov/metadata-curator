import {default as db} from '../db/db.js';

import {default as formioClient} from '../clients/formio_client.js';

await db.init();
let allUploads = await db.DataUploadSchema.find({});
let migrated = 0;
let failed = 0;
let succeeded = 0;
let alreadyMoved = 0;
for (let i=0; i<allUploads.length; i++){
    process.stdout.write("Progress: " + ((migrated++/allUploads.length)*100).toFixed(1) + "%\r");
    let r = allUploads[i];
    let formName = r.form_name ? r.form_name : "uploadForm";
    if ( (!r.ministry_organization) || ( (!r.num_files) && (r.num_files !== 0) ) || (!r.data_create_date) ){
        await new Promise((resolve, reject) => {
            formioClient.getSubmission(formName, r.upload_submission_id, async function(e,formRes){
                try{
                    if (typeof(formRes) === 'string'){
                        formRes = JSON.parse(formRes);
                    }

                    if (e || !formRes || !formRes.data){
                        return reject(r);
                    }

                    let changed = (r.old_submission && (JSON.stringify(r.old_submission) === JSON.stringify(formRes)));
                    r.old_submission = formRes;
                    if ((!r.ministry_organization) && (formRes.data.ministryOrganization)){
                        r.ministry_organization = formRes.data.ministryOrganization;
                        changed = true;
                    }

                    if ( (!r.num_files) &&  ( (formRes.data.numOfUploadFiles) || (formRes.data.numOfUploadFiles === 0) )){
                        r.num_files = formRes.data.numOfUploadFiles;
                        changed = true;
                    }

                    if ((!r.data_create_date) && (formRes.data.createdUpdatedDate)){
                        r.data_create_date = formRes.data.createdUpdatedDate;
                        changed = true;
                    }

                    if ((!r.source) && (formRes.data.sourceSystem)){
                        r.source = formRes.data.sourceSystem;
                        changed = true;
                    }

                    if ((!r.information) && (formRes.data.importantAdditionalInfo)){
                        r.information = formRes.data.importantAdditionalInfo;
                        changed = true;
                    }

                    if ((!r.date_range_start) && (formRes.data.daterangestart)){
                        r.date_range_start = formRes.data.daterangestart;
                        changed = true;
                    }

                    if ((!r.date_range_end) && (formRes.data.dateRangeEnd)){
                        r.date_range_end = formRes.data.dateRangeEnd;
                        changed = true;
                    }
                    
                    if (changed){
                        await r.save();
                    }
                    
                    succeeded++;
                    resolve(r);
                }catch(e){
                    failed++;
                    resolve(r);
                }
            });
        })
    }else{
        alreadyMoved++;
    }
}

process.stdout.write("Done migration migrated: " + succeeded + " failed: " + failed + " skipped (already migrated): " + alreadyMoved + " total: " + allUploads.length);
console.log("\n");
process.exit(0);