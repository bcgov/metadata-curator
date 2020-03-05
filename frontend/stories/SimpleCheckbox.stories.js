import SimpleCheckbox from '../src/components/SimpleCheckbox';
import {withKnobs, text, boolean} from "@storybook/addon-knobs";

export default {
    title: 'SimpleCheckbox',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const checkboxData = {
    label: 'required',
    color: null,
    checked: false
}


const template = `<SimpleCheckbox :label="label" :color="color" :checked="checked" />`;

export const Default = () => ({
    components: {
        SimpleCheckbox
    },
    props: {
        label: {
            default: text('label', checkboxData.label)
        },
        color: {
            default: text('color', checkboxData.color)
        },
        checked: {
            default: checkboxData.checked
        },
    },
    template: template,
    methods: actionsData
});



export const Color = () => ({
    components: {
        SimpleCheckbox
    },
    props: {
        label: {
            default: text('label', checkboxData.label)
        },
        color: {
            default: text('color', 'red')
        },
        checked: {
            default: true
        },
    },
    template: template,
    methods: actionsData
});



