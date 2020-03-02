import TextArea from '../src/components/TextArea';
import {withKnobs, text, boolean} from "@storybook/addon-knobs";

export default {
    title: 'TextArea',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {}

export const textAreaData = {
    name: 'description',
    label: 'Description',
    placeholder: 'Placeholder',
    autogrow: true,
    value: '',
    validationRules: ''
}


const template = `<TextArea :name="name"
                            :label="label"
                            :placeholder="placeholder"
                            :autogrow="autogrow"
                            :validationRules="validationRules"
                             :value="value"/>`;

export const Default = () => ({
    components: {
        TextArea
    },
    props: {
        name: {
            default: text('name', textAreaData.name)
        },
        label: {
            default: text('label', textAreaData.label)
        },
        autogrow: {
            default: boolean('autogrow', textAreaData.autogrow)
        },
        value: {
            default: text('value', textAreaData.value)
        },

        placeholder: {
            default: text('placeholder', textAreaData.placeholder)
        },
        validationRules: {
            default: text('validationRules', textAreaData.validationRules)
        },
    },
    template: template,
    methods: actionsData
});


export const NoPlaceholderProp = () => ({
    components: {
        TextArea
    },
    props: {
        name: {
            default: text('name', textAreaData.name)
        },
        label: {
            default: text('label', textAreaData.label)
        },
        autogrow: {
            default: boolean('autogrow', textAreaData.autogrow)
        },
        value: {
            default: text('value', textAreaData.value)
        },
        placeholder: {
            default: text('placeholder', '')
        },
        validationRules: {
            default: text('validationRules', textAreaData.validationRules)
        },
    },
    template: template,
    methods: actionsData
});


export const WithRequiredValidationRule = () => ({
    components: {
        TextArea
    },
    props: {
        name: {
            default: text('name', textAreaData.name)
        },
        label: {
            default: text('label', textAreaData.label)
        },
        autogrow: {
            default: boolean('autogrow', textAreaData.autogrow)
        },
        value: {
            default: text('value', textAreaData.value)
        },
        placeholder: {
            default: text('placeholder', textAreaData.placeholder)
        },
        validationRules: {
            default: text('validationRules', 'required')
        },
    },
    template: template,
    methods: actionsData
});
