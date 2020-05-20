<template>


    <v-container>
        <v-stepper v-model="e1">
            <v-stepper-header>
                <v-stepper-step :complete="e1 > 1" step="1">Upload Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="e1 > 2" step="2">File Selection</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="3" :complete="e1 > 3" >File Level Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="4" :complete="e1 > 4" >Upload Progress</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="5">Upload Summary</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-card class="mb-12">
                        <UploadForm ref="uploadForm"></UploadForm>
                    </v-card>
                    <v-btn color="primary" @click="stepSaveUploadForm">Next</v-btn>
<!--                    <v-btn text>Cancel</v-btn>-->
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-card class="mb-12"></v-card>
                    <v-btn color="primary" @click="e1=3">Continue</v-btn>
                    <v-btn text @click="e1=1">Back</v-btn>
                </v-stepper-content>

                <v-stepper-content step="3">
                    <v-card
                        class="mb-12"
                    ></v-card>
                    <v-btn
                        color="primary"
                        @click="e1 = 4"
                    >
                        Continue
                    </v-btn>

                    <v-btn text>Cancel</v-btn>
                </v-stepper-content>
                <v-stepper-content step="4">
                    <v-card
                        class="mb-12"
                    ></v-card>
                    <v-btn
                        color="primary"
                        @click="e1 = 5"
                    >
                        Continue
                    </v-btn>
                    <v-btn text>Cancel</v-btn>
                </v-stepper-content>
                <v-stepper-content step="5">
                    <v-card
                        class="mb-12"
                    ></v-card>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>

    </v-container>
</template>
<script>

    import {mapActions, mapMutations, mapState} from "vuex";
    import UploadForm from "../UploadForm";

    export default {
        components:{
            UploadForm
        },
        created() {

        },
        methods: {
            ...mapActions({
            }),
            ...mapMutations({
            }),
            triggerUploadFormSubmit() {
                console.log("triggerUploadFormSubmit btn clicked");
                this.$refs.uploadForm.submitForm();
            },
            async stepSaveUploadForm() {
              if(this.$refs.uploadForm.validateForm()) {
                  await this.triggerUploadFormSubmit();
                  this.e1 = 2;
              }
              else {
                //still trigger submit so form displays all validation errors on UI
                this.triggerUploadFormSubmit();
              }
            }
        },
        data () {
            return {
                e1: 1,
            }
        },
        computed: {
            ...mapState({
            }),
        },
        watch: {

        },
        beforeDestroy() {
        },
    }
</script>
<style scoped>
</style>
