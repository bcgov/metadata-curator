<template>
    <div>
        <div v-if="commentDisplayItems.length == 0" class="ml-3">
            {{$tc('Nothing here yet, why not start a discussion')}}
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
                        @click="expand(index)"
                        :key="item.title"
                    >
                        <v-btn icon :key="'comment-icon-btn-'+index+'-'+refreshKey" class="mr-4">
                            <v-icon>mdi-comment-multiple</v-icon>
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
        <div>
            <Markdown
                name="comment"
                value=""
                :key="'md-comment-'+refreshKey"
                :label="$tc('New Comment')"
                :editing="true"
                :placeholder="$tc('New Comment')"
                @edited="(newValue) => { setComment(newValue) }"
            ></Markdown>
            <v-btn color="primary" @click="addComment">Add Comment</v-btn>
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
            }
        },
        data: () => ({
            message: '',
            expanded: [],
            refreshKey: 0,
            comment: ""
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
            }
        },
        mounted(){
            switch(this.type){
                case 'repo':
                    this.getRepoComments(this.id);
                    break;
                case 'upload':
                    this.getUploadComments(this.id);
                    break;
                case 'branch':
                    this.getBranchComments(this.id);
                    break;
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
                }
                return []
            },
            
            commentDisplayItems: function(){
                let items = [];
                let self = this;
                this.comments.forEach( (comment, index) => {
                    // console.log("comment: ", comment);
                    const createDate = this.$options.filters.formatDate(comment.create_ts);
                    const item = {
                        subtitle: "Updated on " + createDate + " by " + comment.author_user,
                        content: comment.comment,
                        comment: comment
                    };
                    items.push(item);
                    self.expanded.push(false);
                    if(index <= this.comments.length - 1) {
                        items.push({ divider: true, inset: true });
                        self.expanded.push(false);
                    }
                });
                // console.log("computed items: ", items);
                return items;
            }
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
