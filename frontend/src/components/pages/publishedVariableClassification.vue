<template>
    <v-container fluid>
        <v-row dense>
            <VariableClassificationForm :editable=false></VariableClassificationForm>
        </v-row>
    </v-container>
</template>
<script>

import VariableClassificationForm from '../VariableClassificationForm';

import { mapActions, mapState } from 'vuex';

export default {
    components:{
        VariableClassificationForm,
    },
    
    data () {
        return {
            id: null,
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
        
        this.id = this.$route.params.id;
        
        this.getVariableClassification({field: '_id', value: this.id});
    },
}
</script>

<style scoped>
    .fullWidth{
        width: 100%;
    }

</style>