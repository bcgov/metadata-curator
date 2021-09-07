<template>
    <v-container fluid>
        <v-row>
            <v-alert
                :type="alertType"
                dismissable
                v-model="alert">
                    {{alertText}}
            </v-alert>
        </v-row>

        <v-row>
            <v-dialog 
                v-model="branchDia"
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition">
                    <v-card>
                        <v-card-text>
                            <BranchForm :dialog="true" @close="branchDia = false" :branchId="branch"></BranchForm>
                        </v-card-text>
                    </v-card>
            </v-dialog>
            <v-col cols="12">
                <v-card outlined>
                    <v-card-text>
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Datasets") : $tc("Datasets") + " " + dataset.name}}</h1>
                        </v-row>

                        <v-row v-if="!creating">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row>
                            <TextInput
                                :label="$tc('Name')"
                                :placeholder="$tc('My') + ' ' + $tc('Dataset')"
                                name="name"
                                :large="true"
                                :editing="editing"
                                :value="(dataset) ? dataset.name : ''"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                        </v-row>

                        <v-row wrap v-if="!creating">
                            <v-col cols=3>
                                <h2>{{$tc('Versions', 2)}}</h2>
                            </v-col>
                            <v-col cols=9>
                                <v-btn color="primary" @click="addVersion">{{$tc('Add')}} {{$tc('Version')}}</v-btn>
                            </v-col>

                            <v-col cols=12 class="pointer" @click="editVersion(branch._id)" v-for="(branch, i) in branches" :key="'branch-'+i">
                                {{branch.name}} 
                                - {{branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}} 
                                - {{$tc('Created')}} {{branch.create_date | formatDate}} 
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from './TextInput';
import BranchForm from './BranchForm';

export default {
    components:{
        TextInput,
        BranchForm,
    },    
    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            branchDia: false,
            branch: "create",
            alert: false,
            alertText: "",
            alertType: "success",
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            saveDataset: 'repos/saveRepo',
            updateDataset: 'repos/updateRepo',
            getBranches: 'repos/getBranches',
        }),
        ...mapMutations({    
            editDataset: 'repos/editRepo',
            clearDataset: 'repos/clearRepo',
        }),

        async loadSections() {
            await this.getDataset({id: this.id});
            await this.getBranches({repoId: this.id});
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'datasets' });
        },

        updateValues(name, value){
            this.editDataset({name: name, value: value});
        },

        addVersion(){
            this.branch = "create";
            this.branchDia = true;
        },

        editVersion(id){
            this.branch = id;
            this.branchDia = true;
        },

        save(){
            if (this.creating){
                this.saveDataset().then( () => {
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created dataset");
                        this.alert = true;
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                    });
            }else{
                this.updateDataset().then( () => {
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created dataset");
                        this.alert = true;
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                    });
            }
                
        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataset: state => state.repos.repo,
            branches: state => state.repos.branches,
        }),
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
        }else{
            this.loadSections();
        }
    },
    beforeDestroy(){
        this.clearDataset();
    }
}
</script>

<style scoped>

.pointer{
    cursor: pointer;
}

</style>