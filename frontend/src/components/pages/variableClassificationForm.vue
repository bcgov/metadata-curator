<template>
    <v-container fluid>
        <v-row dense>
            <VariableClassificationForm></VariableClassificationForm>
        </v-row>
        
        <v-row v-if="!creating">
            <v-col cols=12>
                <h3>Discussion</h3>
            </v-col>
        </v-row>

        <v-row v-if="!creating">
            <v-col cols=12>
                <Comments :id="id" :type="'variableClassification'"></Comments>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

import VariableClassificationForm from '../VariableClassification/VariableClassificationForm';

import Comments from '../Comments';

import { mapActions, mapState } from 'vuex';

export default {
    components:{
        VariableClassificationForm,
        Comments,
    },
    
    data () {
        return {
            id: null,
            creating: false,
        }
    },

    methods: {
        ...mapActions({
            getVariableClassification: 'variableClassifications/getItem',
        }),
      
    },
    computed: {
        ...mapState({
            variableClassification: state => state.variableClassifications.wipItem,
        }),
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
        }else{
            this.getVariableClassification({field: '_id', value: this.id});
        }
    },
}
</script>

<style scoped>
    .fullWidth{
        width: 100%;
    }

</style>