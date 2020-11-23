<template>
    <v-container fluid>
        <v-alert
            :type="alertType"
            dismissable
            v-model="alert">
                {{alertText}}
        </v-alert>
        <span v-if="!dataset">
            <v-row dense>
                Loading...
            </v-row>
            <v-row>
                <v-btn @click="routeToHome()" class="mt-1">Back</v-btn>
            </v-row>
        </span>
        <v-row v-else dense>
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
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? "New Dataset" : "Dataset " + id}}</h1>
                        </v-row>

                        <v-row>
                            <TextInput
                                label="Name"
                                placeholder="My Dataset"
                                name="name"
                                :editing="editing"
                                :value="(dataset) ? dataset.name : ''"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                        </v-row>

                        <v-row wrap v-if="!creating">
                            <v-col cols=12>
                                <h2>Versions</h2>
                            </v-col>
                            <v-col cols=12>
                                <v-btn color="primary" @click="addVersion">Add Version</v-btn>
                            </v-col>

                            <v-col cols=12 class="pointer" @click="editVersion(branch._id)" v-for="(branch, i) in branches" :key="'branch-'+i">
                                {{branch.name}} 
                                - {{branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}} 
                                - Created {{branch.create_date | formatDate}} 
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="routeToHome()" class="mt-1">Cancel</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">Save</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                    <v-btn @click="routeToHome()" class="mt-1">Back</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">Edit</v-btn>
                </v-card-actions>
            </v-col>

        </v-row>
    </v-container>
</template>
<script>

import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from '../TextInput';
import BranchForm from '../BranchForm';

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
                        this.alertText = "Sucessfully created dataset";
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
                        this.alertText = "Sucessfully created dataset";
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
            this.clearDataset();
            this.creating = true;
        }else{
            this.loadSections();
        }
    }
}
</script>
<style scoped>
    .pointer{
        cursor: pointer;
    }

    .scroll {
        overflow-y: auto;
    }

    .card-outter {
        position: relative;
        padding-bottom: 15px;
    }
    .card-actions {
        position: absolute;
        bottom: 0;
        right: 0;
    }
    
    .fixedHeight{
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
    }

</style>

<style>
    .v-label.v-label--is-disabled.theme--light{
        color: rgba(0,0,0,.87);
    }
    .v-label.v-label--is-disabled.theme--dark{
        color: var(--v-text-base);
    }
</style>
