import TextInput from '../src/components/TextInput';
import {withKnobs, text} from "@storybook/addon-knobs";

export default {
    title: 'TextInput',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const textInputData = {
    name: 'fname',
    label: 'First Name',
    placeholder: 'Placeholder',
    value: '',
}


const template = `<TextInput :name="name" 
                            :label="label"
                            :placeholder="placeholder"
                             :value="value"/>`;

export const Default = () => ({
    components: {
        TextInput
    },
    props: {
        name: {
            default: text('name', textInputData.name)
        },
        label: {
            default: text('label', textInputData.label)
        },
        value: {
            default: text('value', textInputData.value)
        },
        placeholder: {
            default: text('placeholder', textInputData.placeholder)
        },
    },
    template: template,
    methods: actionsData
});


export const NoPlaceholderProp = () => ({
    components: {
        TextInput
    },
    props: {
        name: {
            default: text('name', textInputData.name)
        },
        label: {
            default: text('label', textInputData.label)
        },
        value: {
            default: text('value', textInputData.value)
        },
        placeholder: {
            default: text('placeholder', '')
        },
    },
    template: template,
    methods: actionsData
});
