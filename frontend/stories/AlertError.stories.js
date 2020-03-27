import AlertError from '../src/components/AlertError';
import {withKnobs, text} from "@storybook/addon-knobs";

export default {
    title: 'AlertError',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {}

export const alertData = {
    message: 'Failed to save.'
}


const template = `<AlertError :message="message"></AlertError>`;

export const Default = () => ({
    components: {
        AlertError
    },
    props: {
        message: {
            default: text('name', alertData.message)
        },
    },
    template: template,
    methods: actionsData
});



