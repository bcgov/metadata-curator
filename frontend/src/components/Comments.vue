<template>
    <div>
        <div v-if="commentDisplayItems.length == 0" class="ml-3">
            Nothing here yet, why not start a discussion with the add comment to discussion button
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
                            <v-list-item-title :class="expanded[index] ? 'expanded' : ''" v-html="item.content"></v-list-item-title>
                            <v-list-item-action-text v-html="item.subtitle"></v-list-item-action-text>
                        </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script>

    import {mapActions, mapState} from "vuex";

    export default {
        data: () => ({
            message: '',
            expanded: [],
            refreshKey: 0,
        }),
        methods: {
            ...mapActions({
                getComments: 'dataUploadComments/getComments',
            }),
            expand(index) {
                this.expanded[index] = !this.expanded[index];
                this.refreshKey++;
            }
        },
        computed: {
            ...mapState({
                comments: state => state.dataUploadComments.comments
            }),
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
