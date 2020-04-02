import CommentAddDialog from '../src/components/CommentAddDialog';
import {withKnobs, boolean} from "@storybook/addon-knobs";

export default {
    title: 'CommentAddDialog',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const commentDialogData = {
    dialog: true,
}


const template = `<CommentAddDialog dialog="dialog" />`;

export const Default = () => ({
    components: {
        CommentAddDialog
    },
    props: {
        dialog: {
            default: boolean('dialog', commentDialogData.dialog)
        },
    },
    template: template,
    methods: actionsData
});




