<script>
    
    export default {
        components: {
        },
        mounted: function () {
        },
        methods: {
            getTitle: function(workingVal){
                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.title){
                    return workingVal._currentDescriptor.title;
                }
                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].schema && workingVal._currentDescriptor.resources[0].schema.title){
                        return workingVal._currentDescriptor.resources[0].schema.title;
                    }
                }
                return "";
            },

            getDescription: function(workingVal){
                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.description){
                    return workingVal._currentDescriptor.description;
                }

                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].schema && workingVal._currentDescriptor.resources[0].schema.description){
                        return workingVal._currentDescriptor.resources[0].schema.description;
                    }
                }
                
                return "";
            },

            getFields: function(workingVal){
                if (workingVal && workingVal.fields){
                    return workingVal.fields;
                }

                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].schema && workingVal._currentDescriptor.resources[0].schema.fields){
                        return workingVal._currentDescriptor.resources[0].schema.fields
                    }
                }

                return [];
            },

            getResources: function(workingVal, comparedTo){
                let r = [];

                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].schema && workingVal._currentDescriptor.resources[0].schema.resources){
                        r = workingVal._currentDescriptor.resources[0].schema.resources;
                    }else{
                        r = workingVal._currentDescriptor.resources
                    }
                }else if (workingVal && workingVal.resources && workingVal.resources[0]){
                    if (workingVal.resources[0].schema && workingVal.resources[0].schema.resources){
                        r = workingVal.resources[0].schema.resources
                    }else{
                        r = workingVal.resources;
                    }
                }

                if (typeof(comparedTo) !== 'undefined'){
                    let c = [];
                    if (comparedTo && comparedTo._currentDescriptor && comparedTo._currentDescriptor.resources){
                        if (comparedTo._currentDescriptor.resources[0] && comparedTo._currentDescriptor.resources[0].schema && comparedTo._currentDescriptor.resources[0].schema.resources){
                            c = comparedTo._currentDescriptor.resources[0].schema.resources;
                        }else{
                            c = comparedTo._currentDescriptor.resources
                        }
                    }else if (comparedTo && comparedTo.resources && comparedTo.resources[0]){
                        if (comparedTo.resources[0].schema && comparedTo.resources[0].schema.resources){
                            c = comparedTo.resources[0].schema.resources
                        }else{
                            c = comparedTo.resources;
                        }
                    }

                    for (let i=0; i<r.length; i++){
                        
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            if (c[i] && c[i].schema && c[i].schema.fields[j]){
                                let cKeys = Object.keys(c[i].schema.fields[j]);
                                for (let k=0; k<cKeys.length; k++){
                                    if (typeof(r[i].schema.fields[j][cKeys[k]]) === 'undefined'){
                                        r[i].schema.fields[j][cKeys[k]] = "<Not Specified>";
                                    }
                                }
                            }
                            r[i].schema.fields[j] = Object.keys(r[i].schema.fields[j]).sort().reduce(
                                (obj, key) => { 
                                    obj[key] = r[i].schema.fields[j][key]; 
                                    return obj;
                                }, 
                                {}
                            );
                        }
                    }
                    
                }

                return r;
            },

            replacerFunc: function(){
                const visited = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (visited.has(value)) {
                            console.log("Replacing key", key);
                            return;
                        }
                        visited.add(value);
                    }
                    return value;
                };
            },
        }
    }
</script>


<style scoped>

    .none{
        background: none;
        color: var(--v-text-base);
    }
</style>