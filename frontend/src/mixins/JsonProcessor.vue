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
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].tableSchema && workingVal._currentDescriptor.resources[0].tableSchema.title){
                        return workingVal._currentDescriptor.resources[0].tableSchema.title;
                    }
                }
                return "";
            },

            getDescription: function(workingVal){
                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.description){
                    return workingVal._currentDescriptor.description;
                }

                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].tableSchema && workingVal._currentDescriptor.resources[0].tableSchema.description){
                        return workingVal._currentDescriptor.resources[0].tableSchema.description;
                    }
                }
                
                return "";
            },

            getFields: function(workingVal){
                if (workingVal && workingVal.fields){
                    return workingVal.fields;
                }

                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].tableSchema && workingVal._currentDescriptor.resources[0].tableSchema.fields){
                        return workingVal._currentDescriptor.resources[0].tableSchema.fields
                    }
                }

                return [];
            },

            getResources: function(workingVal){
                if (workingVal && workingVal._currentDescriptor && workingVal._currentDescriptor.resources){
                    if (workingVal._currentDescriptor.resources[0] && workingVal._currentDescriptor.resources[0].tableSchema && workingVal._currentDescriptor.resources[0].tableSchema.resources){
                        return workingVal._currentDescriptor.resources[0].tableSchema.resources;
                    }
                    return workingVal._currentDescriptor.resources
                }else if (workingVal && workingVal.resources && workingVal.resources[0]){
                    if (workingVal.resources[0].tableSchema && workingVal.resources[0].tableSchema.resources){
                        return workingVal.resources[0].tableSchema.resources
                    }
                    return workingVal.resources;
                }

                return [];
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