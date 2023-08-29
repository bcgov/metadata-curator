<template>
    <v-container fluid>
        <v-row dense>
            <ProjectForm></ProjectForm>
        </v-row>
        
        <v-row v-if="!creating">
            <v-col cols=12>
                <h3>Discussion</h3>
            </v-col>
        </v-row>

        <v-row v-if="!creating">
            <v-col cols=12>
                <Comments :id="id" :type="'project'"></Comments>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

import ProjectForm from '../Projects/ProjectForm';

import Comments from '../Comments';

import { mapActions, mapState } from 'vuex';

export default {
    components:{
      ProjectForm,
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
            getProject: 'projects/getItem',
        }),
      
    },
    computed: {
        ...mapState({
            project: state => state.project.wipItem,
        }),
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
        }else{
            this.getProject({field: '_id', value: this.id});
        }
    },
}
</script>

<style scoped>
    .fullWidth{
        width: 100%;
        overflow: visible;
    }

</style>