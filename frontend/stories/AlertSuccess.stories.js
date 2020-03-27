import AlertSuccess from '../src/components/AlertSuccess';
import {withKnobs, text} from "@storybook/addon-knobs";

export default {
    title: 'AlertSuccess',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {}

export const alertData = {
    message: 'Successfully saved.'
}


const template = `<AlertSuccess :message="message"></AlertSuccess>`;

export const Default = () => ({
    components: {
        AlertSuccess
    },
    props: {
        message: {
            default: text('name', alertData.message)
        },
    },
    template: template,
    methods: actionsData
});



