<template>
    <div style="width: 85%;">
        <v-list three-line style="margin-bottom: 15px;">
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
                        <v-btn icon class="mr-4" @click="routeToHome()">
                            <v-icon>mdi-comment-multiple</v-icon>
                        </v-btn>

                        <v-list-item-content>
                            <v-list-item-title v-html="item.content"></v-list-item-title>
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
        }),
        methods: {
            ...mapActions({
                getComments: 'dataUploadComments/getComments',
            }),
            routeToHome() {
                console.log("routeToHome uploadId");
                this.$router.push({ name: 'home' })
            }
        },
        computed: {
            ...mapState({
                comments: state => state.dataUploadComments.comments
            }),
            commentDisplayItems: function(){
                let items = [];
                this.comments.forEach( (comment, index) => {
                    // console.log("comment: ", comment);
                    const createDate = this.$options.filters.formatDate(comment.create_ts);
                    const item = {
                        subtitle: "Updated on " + createDate + " by " + comment.author_user,
                        content: comment.comment,
                        comment: comment
                    };
                    items.push(item);
                    if(index <= this.comments.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
                // console.log("computed items: ", items);
                return items;
            }
        },
    };
</script>

<style scoped>

</style>
