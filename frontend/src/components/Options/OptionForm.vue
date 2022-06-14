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
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Option") : $tc("Option") + " " + (option ? option.type : '')}}</h1>
                        </v-row>

                        <v-row v-if="!creating && editable">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Type')"
                                    :placeholder="'tags'"
                                    name="type"
                                    validation-rules="required"
                                    :large="true"
                                    :editing="editing"
                                    :value="(option) ? option.type : ''"
                                    helpPrefix="option"
                                    @edited="(newValue) => { updateValues('type', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <span v-if="option" class="mt-4">
                            <v-row v-for="(value, key) in option.values" :key="'option-values-'+key" class="bordered">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Text')"
                                        :placeholder="'GBA+'"
                                        name="text"
                                        validation-rules="required"
                                        :editing="editing"
                                        :value="(value) ? value.text : ''"
                                        helpPrefix="option.values"
                                        @edited="(newValue) => { updateValueValues(key, 'text', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Value')"
                                        :placeholder="'gba+'"
                                        name="value"
                                        :editing="editing"
                                        validation-rules="required"
                                        :value="(value) ? value.value : ''"
                                        helpPrefix="option.values"
                                        @edited="(newValue) => { updateValueValues(key, 'value', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=9 v-if="editing">
                                </v-col>
                                <v-col cols=3 v-if="editing">
                                    <v-btn color="error" @click="removeValue">Remove Value</v-btn>
                                </v-col>
                            </v-row>
                        </span>
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
            geOption: 'options/getOptionById',
            saveOption: 'options/saveOption',
            updateOption: 'options/updateOption',
        }),
        ...mapMutations({
            editOption: 'options/editOption',
            clearOption: 'options/clearOption',
        }),

        async loadSections() {
            await this.clearOption();
            await this.geOption({id: this.id});
        },

        addValue() {
            let values = typeof(this.option.values)==='object' ? JSON.parse(JSON.stringify(this.option.values)) : [];
            values.push({
                text: "",
                value: "",
            });
            this.editOption({name: 'values', value: values});
        },

        removeValue(key) {
            let values = typeof(this.option.values)==='object' ? JSON.parse(JSON.stringify(this.option.values)) : [];
            values.splice(key, 1);
            this.ediOption({name: 'values', value: values});
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'options' });
        },

        updateValues(name, value){
            this.editOption({name: name, value: value});
        },

        updateValueValues(key, name, value){
            let v = JSON.parse(JSON.stringify(this.option.values));
            v[key][name] = value;
            this.editOption({name: 'values', value: v});
        },

        save(){
            if (this.creating){
                this.saveOption({option: this.option}).then( async() => {
                        if ( (this.optionError !== null) && (this.optionError !== "") ){
                            this.alertType = "error"
                            this.alertText = this.optionError;
                            this.alert = true;
                            window.scrollTo(0,0);
                            return;
                        }
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created option");
                        this.alert = true;
                        window.scrollTo(0,0);
                        await this.clearOption();
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });
            }else{
                this.updateOption({option: this.option}).then( async() => {
                        if ( (this.optionError !== null) && (this.optionError !== "") ){
                            this.alertType = "error"
                            this.alertText = this.optionError;
                            this.alert = true;
                            window.scrollTo(0,0);
                            return;
                        }
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully updated option");
                        this.alert = true;
                        window.scrollTo(0,0);
                        await this.clearOption();
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
            option: state => state.options.option,
            optionError: state => state.options.error,
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