<template>
    <div>
        <div v-if="commentDisplayItems.length == 0 && type !== 'schema'" class="ml-3">
            {{$tc('Nothing here yet, why not start a discussion')}}
        </div>

        <div v-if="commentDisplayItems.length == 0 && type === 'schema'" class="ml-3">
            {{$tc('No comments about this field, reference with ')}}!{{resource}}.{{field}}
        </div>
        <v-list v-else three-line class="mb-3">
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
                        <v-btn icon :key="'comment-icon-btn-'+index+'-'+refreshKey" class="mr-4">
                            <v-icon>mdi-comment-multiple</v-icon>
                        </v-btn>

                        <v-btn x-small @click="expand(index)">
                            <v-icon>{{expanded[index] ? 'mdi-minus' : 'mdi-plus'}}</v-icon>
                        </v-btn>

                        <v-list-item-content>
                            <v-list-item-title :class="expanded[index] ? 'expanded' : ''">
                                <Markdown
                                    name=""
                                    :value="item.content"
                                    :label="$tc('')"
                                    :editing="false"
                                    :placeholder="$tc('')"
                                ></Markdown>
                            </v-list-item-title>
                            <v-list-item-action-text v-html="item.subtitle"></v-list-item-action-text>
                        </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
        <div v-if="type !== 'schema'">
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
            <v-btn color="primary" @click="addComment" :disabled="comment === ''" v-if="(comment !== '') || commentFocused">Add Comment</v-btn>
        </div>
        <div v-else>
            <v-btn color="primary" @click="scrollBottom">Add a comment below</v-btn>
        </div>
    </div>
</template>

<script>

import {mapActions} from "vuex";
import Markdown from './Markdown.vue';

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
                        comment: comment
                    };

                    let fieldRef = "!" + self.resource + "." + self.field;

                    if ( (self.type !== 'schema') || ( (fieldRef.length > 2) && (comment.comment.indexOf(fieldRef) !== -1) ) ){

                        for (let i=0; i<this.refable.length; i++){
                            let target = "!"+this.refable[i].text;
                            let ind = item.content.indexOf(target);
                            if (ind !== -1){
                                item.content = item.content.replaceAll(target, '['+target+']('+this.refable[i].link+')')
                            }
                            
                        }

                        if (self.commentDisplayItems.length > 0){
                            self.commentDisplayItems.push({ divider: true, inset: true });
                            self.expanded.push(false);
                        }
                        self.commentDisplayItems.push(item);
                        self.expanded.push(false);
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
                }
                
                this.comment = "";
                this.refreshKey++;
            },

            scrollBottom(){
                let fieldRef = "!" + this.resource + "." + this.field;
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
                }
                return []
            },
        },
    };
</script>

<style scoped>

    .v-list-item__subtitle, .v-list-item__title.expanded{
        text-overflow: unset;
        overflow: visible;
        white-space: break-spaces;
    }

</style>
