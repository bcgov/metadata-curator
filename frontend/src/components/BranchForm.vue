<template>
    <v-container fluid>
        <v-alert
            :type="alertType"
            dismissable
            v-model="alert">
                {{alertText}}
        </v-alert>
        <span v-if="!branch && !creating">
            <v-row dense>
                Loading...
            </v-row>
            <v-row>
                <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? 'Close' : 'Back'}}</v-btn>
            </v-row>
        </span>
        <v-row v-else dense>
            <v-col cols="12">
                <v-card outlined>
                    <v-card-text>
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? "New Version" : "Version " + id}}</h1>
                        </v-row>

                        <v-row>
                            <TextInput
                                label="Name"
                                placeholder="Default"
                                name="name"
                                :editing="editing"
                                :value="(branch) ? branch.name : ''"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                        </v-row>

                        <v-row>
                            <Select
                                label="Type"
                                name="type"
                                :editing="editing"
                                :value="(branch) ? branch.type : ''"
                                :items="types"
                                @edited="(newValue) => { updateValues('type', newValue) }"
                            ></Select>
                        </v-row>

                        <v-row>
                            <TextArea
                                label="Description"
                                placeholder="description"
                                name="description"
                                :editing="editing"
                                :value="(branch) ? branch.description : ''"
                                @edited="(newValue) => { updateValues('description', newValue) }"
                            ></TextArea>
                        </v-row>

                          <v-row>
                             <Select
                                label="Data Upload"
                                name="upload_id"
                                :editing="editing"
                                :value="(branch) ? branch.data_upload_id : ''"
                                :items="dataUploads"
                                item-text="name"
                                item-value="_id"
                                @edited="(newValue) => { updateValues('upload_id', newValue) }"
                            ></Select>
                        </v-row>


                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? 'Close' : 'Back'}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">Save</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                    <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? 'Close' : 'Back'}}</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">Edit</v-btn>
                </v-card-actions>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from './TextInput';
import TextArea from './TextArea';
import Select from './Select';

export default {
    components:{
        TextInput,
        Select,
        TextArea,
    },
    props: {
        dialog: {
            type: Boolean,
            default: false,
        },
        branchId: {
            type: String,
            default: "",
        },

    },
    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            types: [ {text: 'Standard', value: 'standard'}, {text: 'Reserve', value: 'reserve'} ],
            alert: false,
            alertType: "success",
            alertText: ""
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            saveBranch: 'repos/saveBranch',
            updateBranch: 'repos/updateBranch',
            getBranch: 'repos/getBranch',
            getDataUploads: 'dataUploads/getDataUploads',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
        }),

        async loadSections() {
            await this.getBranch({id: this.id});
        },

        closeOrBack() {
            if (this.dialog){
                this.$emit('close');
            }else{
                this.$router.push({ name: 'versions' });
            }
        },

        updateValues(name, value){
            this.editBranch({name: name, value: value});
        },

        async load(){
            // console.log("dataUpload id: " + this.$route.params.id);
            this.id = (this.branchId) ? this.branchId : this.$route.params.id;
            await this.getDataUploads("team");
            if (this.id === 'create'){
                this.editing = true;
                this.creating = true;
            }else{
                this.loadSections();
            }
        },

        save(){
            if (this.creating){
                this.saveBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = "Sucessfully created version";
                    this.alert = true;
                    this.closeOrBack();

                }).catch( err => {
                    this.alertType = "error"
                    this.alertText = err.message;
                    this.alert = true;
                });
            }else{
                this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = "Sucessfully updated version";
                    this.alert = true;
                    this.$emit("close");

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
            branch: state => state.repos.branch,
            dataUploads: state => state.dataUploads.dataUploads,
        }),
    },
    watch: {
        branchId: function(){
            this.load();
        }
    },
    
    created() {
        this.load()
    },

    beforeDestroy(){
        this.clearBranch();
    }
}
</script>
<style scoped>
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
