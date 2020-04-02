<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
<!--        <v-form-->
<!--            ref="form"-->
<!--            v-model="valid"-->
<!--            :lazy-validation="lazy">-->
            <v-card>
                <v-card-title>
                    <span class="headline">Add Comment</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <TextInput name="comment" label="Comment" validationRules="required" :value="commentVal"
                                @edited="onCommentUpdated" ref="comment"></TextInput>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="onCloseClicked">Close</v-btn>
                    <v-btn color="blue darken-1" text @click="onSaveClicked">Save</v-btn>
                </v-card-actions>
            </v-card>
<!--        </v-form>-->
    </v-dialog>
</template>

<script>

    import {mapActions} from "vuex";
    import ValidationRules from "../mixins/ValidationRules";
    import TextInput from "./TextInput";

    export default {
        mixins: [ValidationRules],
        components:{
            TextInput
        },
        props: {
            dialog: {
                type: Boolean,
                required: true,
                default: () => false
            },
        },
        data: () => ({
            valid: true,
            lazy: false,
            commentVal: '',
        }),
        methods: {
            ...mapActions({
                // getComments: 'dataUploadComments/getComments',
            }),
            onCloseClicked: function(){
                console.log("onCloseClicked");
                console.log("commentVal: " + this.commentVal);
                this.$emit('close-button-clicked');
                this.clearData();
            },
            onSaveClicked: function(){
                // console.log("onSaveClicked");
                console.log("this.commentVal: " + this.commentVal);
                this.$emit('save-button-clicked', this.commentVal);
                // this.clearData();
                this.$refs.comment.clearValidation();
            },
            clearData: function() {
                this.commentVal = '';
            },
            onCommentUpdated: function(newVal) {
                console.log("comentUpdated: " + newVal);
                this.commentVal = newVal;
            }
        },
        watch: {
            commentVal: function (newVal, oldVal) {
                console.log(`commentVal changed - oldVal: ${oldVal}, newVal: ${newVal}`);
            },
            dialog: function (newVal, oldVal) {
                if(newVal) {
                    if(this.$refs.form) {
                        this.$nextTick(this.$refs.comment.$el.focus());
                    }
                }
                console.log(`dialog changed - oldVal: ${oldVal}, newVal: ${newVal}`);
                if(oldVal === false && newVal) {
                    console.log("model opening");


                    if(this.$refs.comment) {
                        this.$nextTick(this.$refs.comment.$refs.txtField.$el.focus());
                    //     this.$nextTick(() => {
                    //         console.log("next tick");
                    //         // this.$refs.comment.$refs.txtField.reset();
                    //         this.$refs.comment.$refs.txtField.focus;
                    //     });
                    //     // this.$refs.comment.focus();
                    //     // this.$refs.comment.clearValidation();
                    }

                }
            }

        }

    };
</script>

<style scoped>

</style>
