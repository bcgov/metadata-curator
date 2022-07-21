<template>
    <v-container fluid>
        <v-row>
            <v-col cols=12>
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card outlined>
                    <v-card-text>
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Classification Index") : $tc("Classification Index") + " " + variableClassification.name}}</h1>
                        </v-row>

                        <v-row v-if="!creating && editable">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row>
                            <TextInput
                                :label="$tc('Name')"
                                :placeholder="'V01'"
                                name="name"
                                validation-rules="required"
                                :large="true"
                                :editing="editing"
                                :value="(variableClassification) ? variableClassification.name : ''"
                                helpPrefix="variableClassification"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <SimpleCheckbox
                                    :label="$tc('Published')"
                                    :placeholder="$tc('Published')"
                                    name="published"
                                    :editing="editing"
                                    :disabled="!editing || (!user.isApprover && !user.isAdmin)"
                                    :checked="(variableClassification) ? variableClassification.published : false"
                                    helpPrefix="variableClassification"
                                    @edited="(newValue) => { updateValues('published', newValue) }"
                                ></SimpleCheckbox>
                                <router-link v-if="variableClassification.published && location && editable" :to="{ name: 'publishedVariableClassification', params: { id: id }}">{{location.protocol + "//" + location.host + $router.resolve({name: 'publishedVariableClassification', params: { id: id } }).href }}</router-link>
                            </v-col>
                        </v-row>

                        <v-row v-for="(value, key) in variableClassification.values" :key="'var-class-values-'+key" class="bordered">
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Code')"
                                    :placeholder="'3a'"
                                    name="code"
                                    validation-rules="required"
                                    :editing="editing"
                                    :value="(value) ? value.code : ''"
                                    helpPrefix="variableClassification.values"
                                    @edited="(newValue) => { updateValueValues(key, 'code', newValue) }"
                                ></TextInput>
                            </v-col>

                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Title')"
                                    :placeholder="'Direct Identifier - excluded'"
                                    name="title"
                                    :editing="editing"
                                    validation-rules="required"
                                    :value="(value) ? value.title : ''"
                                    helpPrefix="variableClassification.values"
                                    @edited="(newValue) => { updateValueValues(key, 'title', newValue) }"
                                ></TextInput>
                            </v-col>

                            <v-col cols=12>
                                <TextArea
                                    :label="$tc('Examples')"
                                    :placeholder="$tc('Examples')"
                                    name="examples"
                                    :editing="editing"
                                    :value="(value) ? value.examples : ''"
                                    helpPrefix="variableClassification.values"
                                    @edited="(newValue) => { updateValueValues(key, 'examples', newValue) }"
                                ></TextArea>
                            </v-col>

                            <v-col cols=12>
                                <TextArea
                                    :label="$tc('Description')"
                                    :placeholder="$tc('Description')"
                                    name="description"
                                    :editing="editing"
                                    :value="(value) ? value.description : ''"
                                    helpPrefix="variableClassification.values"
                                    @edited="(newValue) => { updateValueValues(key, 'description', newValue) }"
                                ></TextArea>
                            </v-col>

                            <v-col cols=12>
                                <TextArea
                                    :label="$tc('Status in DIP Baseline')"
                                    :placeholder="$tc('Status in DIP Baseline')"
                                    name="status"
                                    :editing="editing"
                                    :value="(value) ? value.status : ''"
                                    helpPrefix="variableClassification.values"
                                    @edited="(newValue) => { updateValueValues(key, 'status', newValue) }"
                                ></TextArea>
                            </v-col>
                            <v-col cols=9 v-if="editing">
                            </v-col>
                            <v-col cols=3 v-if="editing">
                                <v-btn color="error" @click="removeValue">Remove Value</v-btn>
                            </v-col>
                        </v-row>
                        <v-row v-if="editing">
                            <v-col cols=12>
                                <v-btn color="primary" @click="addValue">Add Value</v-btn>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else-if="editable">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from '../FormElements/TextInput';
import SimpleCheckbox from '../FormElements/SimpleCheckbox';
import TextArea from '../FormElements/TextArea';

export default {
    props: {
        editable: {
            type: Boolean,
            required: false,
            default: true,
        }
    },
    components:{
        TextInput, 
        SimpleCheckbox,
        TextArea,
    },    
    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            
            alert: false,
            alertText: "",
            alertType: "success",
            location: window.location,
        }
    },
    methods: {
        ...mapActions({
            getVariableClassification: 'variableClassifications/getItem',
            saveVariableClassification: 'variableClassifications/newItem',
            updateVariableClassification: 'variableClassifications/updateItem',
            clearVariableClassifications: 'variableClassifications/clearItems',
        }),
        ...mapMutations({
            editVariableClassification: 'variableClassifications/editItem',
        }),

        async loadSections() {
            await this.clearVariableClassifications();
            await this.getVariableClassification({field: '_id', value: this.id});
        },

        addValue() {
            let values = typeof(this.variableClassification.values)==='object' ? JSON.parse(JSON.stringify(this.variableClassification.values)) : [];
            values.push({
                code: "",
                title: "",
                examples: "",
                description: "",
                status: ""
            });
            this.editVariableClassification({name: 'values', value: values});
        },

        removeValue(key) {
            let values = typeof(this.variableClassification.values)==='object' ? JSON.parse(JSON.stringify(this.variableClassification.values)) : [];
            values.splice(key, 1);
            this.editVariableClassification({name: 'values', value: values});
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'variableClassifications' });
        },

        updateValues(name, value){
            this.editVariableClassification({name: name, value: value});
        },

        updateValueValues(key, name, value){
            let v = JSON.parse(JSON.stringify(this.variableClassification.values));
            v[key][name] = value;
            this.editVariableClassification({name: 'values', value: v});
        },

        save(){
            if (this.creating){
                this.saveVariableClassification({item: this.variableClassification}).then( async() => {
                        if (this.variableClassificationError !== ""){
                            this.alertType = "error"
                            this.alertText = this.variableClassificationError;
                            this.alert = true;
                            window.scrollTo(0,0);
                            return;
                        }
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created variable classification");
                        this.alert = true;
                        window.scrollTo(0,0);
                        await this.clearVariableClassifications();
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });
            }else{
                this.updateVariableClassification({id: this.id, item: this.variableClassification}).then( async() => {
                        if (this.variableClassificationError !== ""){
                            this.alertType = "error"
                            this.alertText = this.variableClassificationError;
                            this.alert = true;
                            window.scrollTo(0,0);
                            return;
                        }
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully updated variable classification");
                        this.alert = true;
                        window.scrollTo(0,0);
                        await this.clearVariableClassifications();
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });
            }
                
        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            variableClassification: state => state.variableClassifications.wipItem,
            variableClassificationError: state => state.variableClassifications.error,
        }),
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            if (this.editable){
                this.editing = true;
                this.creating = true;
            }
        }else{
            this.loadSections();
        }
    },
}
</script>

<style scoped>

.bordered{
    border: 1px solid;
}

</style>