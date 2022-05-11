import TextInput from '../src/components/FormElements/TextInput';
import {withKnobs, text, boolean} from "@storybook/addon-knobs";

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
    validationRules: ''
}


const template = `<TextInput :name="name"
                            :label="label"
                            :placeholder="placeholder"
                            :validationRules="validationRules"
                             :value="value"
                             :outlined="outlined"
                             :normal="normal"
                             />`;

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
        validationRules: {
            default: text('validationRules', textInputData.validationRules)
        },
        outlined: {
            default: text('outlined', false)
        },
        normal: {
            default: text('normal', true)
        },
    },
    template: template,
    methods: actionsData
});

export const Outlined = () => ({
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
        validationRules: {
            default: text('validationRules', textInputData.validationRules)
        },
        outlined: {
            default: text('outlined', true)
        },
        normal: {
            default: text('normal', false)
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
        validationRules: {
            default: text('validationRules', textInputData.validationRules)
        },
        outlined: {
            default: text('outlined', false)
        },
        normal: {
            default: text('normal', true)
        },
    },
    template: template,
    methods: actionsData
});


export const WithRequiredValidationRule = () => ({
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
        validationRules: {
            default: text('validationRules', 'required')
        },
        outlined: {
            default: text('outlined', false)
        },
        normal: {
            default: text('normal', true)
        },
    },
    template: template,
    methods: actionsData
});
