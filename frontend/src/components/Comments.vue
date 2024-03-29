<template>
    <v-container fluid>
        <v-row v-if="commentDisplayItems.length == 0 && type !== 'schema'" class="ml-3">
            <v-col cols=12>
                {{$tc('Nothing here yet, why not start a discussion')}}
            </v-col>
        </v-row>

        <v-row v-if="commentDisplayItems.length == 0 && type === 'schema'" class="ml-3">
            <v-col cols=12>
                {{$tc('No comments about this field, reference with ')}}!{{resource.replaceAll(' ', '+')}}.{{field.replaceAll(' ','+')}}
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols=12>
                <v-list three-line class="mb-3">
                    <template v-for="(item, index) in commentDisplayItems">
                            <v-divider
                                v-if="item.divider"
                                :key="index"
                                :inset="item.inset"
                            ></v-divider>

                            <v-list-item
                                v-else
                                :key="item.title"
                            >

                                <v-list-item-content>

                                    <v-list-item-title :class="(expanded[index] ? 'expanded' : '')">
                                        <v-row>
                                            <v-col cols=1 v-if="item.author && user && user._json && user._json.email && item.author !== user._json.email">
                                                <v-img class="ma-0 pa-0" :src="(item && item.author) ? 'https://www.gravatar.com/avatar/' + calcMd5(item.author.toLowerCase().trim()) : false" :alt="item.author" height="50px" width="50px" contain></v-img>
                                            </v-col>
                                            <v-col cols=1 v-else-if="!item.author || !user || !user._json || !user._json.email">
                                                <v-icon>mdi-account</v-icon>
                                            </v-col>

                                            <v-col cols=1 v-if="((item.content.length >= 75) && (type !== 'schema'))">
                                                <v-btn x-small @click="expand(index)">
                                                    <v-icon>{{expanded[index] ? 'mdi-minus' : 'mdi-plus'}}</v-icon>
                                                </v-btn>
                                            </v-col>

                                            <v-col cols=10 :class="(item.author && user && user._json && user._json.email && item.author === user._json.email) ? 'from-me' : 'from-them'">
                                                <Markdown
                                                    name=""
                                                    :value="item.content"
                                                    :label="$tc('')"
                                                    :editing="false"
                                                    :placeholder="$tc('')"
                                                ></Markdown>
                                            </v-col>

                                            <v-col cols=1 v-if="item.author && user && user._json && user._json.email && item.author === user._json.email">
                                                <v-img class="ma-0 pa-0" :src="(item && item.author) ? 'https://www.gravatar.com/avatar/' + calcMd5(item.author.toLowerCase().trim()) : false" :alt="item.author" height="50px" width="50px" contain></v-img>
                                            </v-col>
                                        </v-row>
                                    </v-list-item-title>
                                    <v-list-item-action-text v-html="item.subtitle"></v-list-item-action-text>
                                </v-list-item-content>

                        </v-list-item>
                    </template>
                </v-list>
            </v-col>
        </v-row>
        <v-row v-if="type !== 'schema'">
            <v-col cols=12>
                <Markdown
                    name="comment"
                    :value="comment"
                    :key="'md-comment-'+refreshKey"
                    :label="$tc('New Comment')"
                    :editing="true"
                    :placeholder="$tc('New Comment')"
                    @focus="commentFocused = true"
                    @blur="commentFocused = false"
                    @edited="(newValue) => { setComment(newValue) }"
                ></Markdown>
            </v-col>
            <v-col cols=12>
                <v-btn color="primary" @click="addComment" :disabled="comment === ''" v-if="(comment !== '') || commentFocused">Add Comment</v-btn>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols=12>
                <v-btn color="primary" @click="scrollBottom">Add a comment below</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapState} from "vuex";
import Markdown from './FormElements/Markdown.vue';
import md5 from 'md5'
import { Backend } from '../services/backend';
const backend = new Backend();

    export default {
        components: {
            Markdown,
        },
        props:{
            id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            resource: {
                type: String,
                required: false,
                default: "",
            },
            field: {
                type: String,
                required: false,
                default: "",
            },
            refable: {
                type: Array,
                required: false,
                default: () => [],
            },
            commentValue: {
                type: String,
                required: false,
                default: ""
            }
        },
        data: () => ({
            message: '',
            expanded: [],
            refreshKey: 0,
            comment: "",
            commentFocused: false,
            commentDisplayItems: [],
            varClassComments: [],
            projectComments: [],
        }),
        methods: {
            ...mapActions({
                getUploadComments: 'dataUploadComments/getComments',
                addUploadComment: 'dataUploadComments/addComment',

                getRepoComments: 'repos/getComments',
                addRepoCommentAction: 'repos/addComment',

                getBranchComments: 'repos/getBranchComments',
                addBranchComment: 'repos/addBranchComment',
            }),
            computeCommentDisplayItems(){
                this.commentDisplayItems = [];
                let self = this;
                this.comments.forEach( (comment) => {
                    // console.log("comment: ", comment);
                    const createDate = this.$options.filters.formatDate(comment.create_ts);
                    const item = {
                        subtitle: "Updated on " + createDate + " by " + comment.author_user,
                        content: comment.comment,
                        comment: comment,
                        author: comment.author_user,
                    };

                    let anchorRegex = /!([^.]+\.\S+)/g;

                    let fieldRef = "!" + self.resource + "." + self.field;
                    fieldRef = fieldRef.replaceAll(' ', '+');
                    if ( (self.type !== 'schema') || ( (fieldRef.length > 2) && (comment.comment.indexOf(fieldRef) !== -1) ) ){
                        item.content = item.content.replace(anchorRegex, "[!$1](#$1)");

                        if (self.commentDisplayItems.length > 0){
                            self.commentDisplayItems.push({ divider: true, inset: true });
                            self.expanded.push(false);
                        }

                        self.commentDisplayItems.push(item);

                        self.expanded.push((this.type === 'schema'));
                    }
                });
            },
            expand(index) {
                this.expanded[index] = !this.expanded[index];
                this.refreshKey++;
            },
            setComment(val){
                this.comment = val;
            },
            async addVarClassComment({id, comment}){
                await backend.postCommentByVarClass(id, comment);
                await this.getVarClassComments(id);
            },
            async addProjectComment({id, comment}){
                await backend.postCommentByProject(id, comment);
                await this.getProjectComments(id);
            },
            async getVarClassComments(id){
                this.varClassComments = await backend.getCommentsByVarClass(id)
            },
            async getProjectComments(id){
              this.projectComments = await backend.getCommentsByProject(id);
            },
            calcMd5(val){
                return md5(val);
            },
            addComment(){
                switch(this.type){
                    case 'repo':
                        this.addRepoCommentAction({repoId: this.id, comment: this.comment})
                        break;
                    case 'upload':
                        this.addUploadComment({dataUploadId: this.id, comment: this.comment});
                        break;
                    case 'branch':
                        this.addBranchComment({branchId: this.id, comment: this.comment});
                        break;
                    case 'variableClassification':
                        this.addVarClassComment({id: this.id, comment: this.comment});
                        break;
                    case 'project':
                        this.addProjectComment({id: this.id, comment: this.comment});
                        break;
                }

                this.comment = "";
                this.refreshKey++;
            },

            scrollBottom(){
                let fieldRef = "!" + this.resource.replaceAll(' ', '+') + "." + this.field.replaceAll(' ', '+');
                window.scrollTo(0,document.body.scrollHeight);
                this.$emit("setComment", fieldRef);
            }
        },
        async mounted(){
            switch(this.type){
                case 'repo':
                    await this.getRepoComments(this.id);
                    break;
                case 'upload':
                    await this.getUploadComments(this.id);
                    break;
                case 'branch':
                    await this.getBranchComments({branchId: this.id});
                    break;
                case 'schema':
                    await this.getBranchComments({branchId: this.id, force: false});
                    break;
                case 'variableClassification':
                    this.getVarClassComments(this.id);
                    break;
                case 'project':
                    this.getProjectComments(this.id);
                    break;
            }

            this.computeCommentDisplayItems();
        },
        watch: {
            resource: function(){
                this.computeCommentDisplayItems();
            },
            field: function(){
                this.computeCommentDisplayItems();
            },
            refable: function(){
                this.computeCommentDisplayItems();
            },
            comments: function(){
                this.computeCommentDisplayItems();
            },
            commentValue: function(newV){
                this.comment = newV;
            }
        },

        computed: {
            ...mapState({
                user: state => state.user.user,
            }),

            comments: function(){
                switch (this.type){
                    case 'repo':
                        return this.$store.state.repos.comments;
                    case 'upload':
                        return this.$store.state.dataUploadComments.comments;
                    case 'branch':
                        return this.$store.state.repos.branchComments;
                    case 'schema':
                        return this.$store.state.repos.branchComments;
                    case 'variableClassification':
                        return this.varClassComments;
                    case 'project':
                        return this.projectComments;
                }
                return []
            },
        },
    };
</script>

<style scoped>

    .v-list-item__subtitle, .v-list-item__title{
        text-overflow: hidden;
        overflow: hidden;
        max-height: 50px;
        white-space: break-spaces;
    }

    .v-list-item__subtitle, .v-list-item__title.expanded{
        text-overflow: unset;
        overflow: visible;
        white-space: break-spaces;
        max-height: unset;
    }

    .from-me{
        text-align: right;
    }

    .from-them{

    }

</style>
