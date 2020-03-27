import AlertValidationError from '../src/components/AlertValidationError';
import {withKnobs, text, object} from "@storybook/addon-knobs";

export default {
    title: 'AlertValidationError',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {}

export const alertData = {
    message: 'Unable to save. Failed validation.',
    validationErrorMessages: [
        {
            message: "Descriptor validation error: Data does not match any schemas from anyOf at /fields/0 in descriptor and at /properties/fields/items/anyOf in profile"
        },
        {
            message: "Descriptor validation error: Data does not match any schemas from anyOf at /fields/1 in descriptor and at /properties/fields/items/anyOf in profile"
        }
    ],
    validationErrorsByResource:
         [
            [
                "resource_1",
                [
                    {
                        "message": "Descriptor validation error: Data does not match any schemas from anyOf at /schema/fields/0 in descriptor and at /properties/schema/properties/fields/items/anyOf in profile"
                    },
                ]
            ],
            [
                "resource_2",
                [
                    {
                        "message": "Descriptor validation error: Data does not match any schemas from anyOf at /schema/fields/0 in descriptor and at /properties/schema/properties/fields/items/anyOf in profile"
                    },
                    {
                        "message": "Descriptor validation error: Data does not match any schemas from anyOf at /schema/fields/2 in descriptor and at /properties/schema/properties/fields/items/anyOf in profile"
                    }
                ]
            ]
        ]
}


const template = `<AlertValidationError
                          :message="message"
                          :validationErrorMessages="validationErrorsMsgs"
                          :validationErrorMessagesByGroup="validationErrorsByResource">
                   </AlertValidationError>`;

export const Default = () => ({
    components: {
        AlertValidationError
    },
    props: {
        message: {
            default: text('name', alertData.message)
        },
        validationErrorsMsgs: {
            default: () => object('validationErrorMessages', [])
        },
        validationErrorsByResource: {
            default: () => object('validationErrorsByResource', [])
        }
    },
    template: template,
    methods: actionsData
});

export const ValidationErrorMessages = () => ({
    components: {
        AlertValidationError
    },
    props: {
        message: {
            default: text('name', alertData.message)
        },
        validationErrorsMsgs: {
            default: () => object('validationErrorMessages', alertData.validationErrorMessages)
        }
    },
    template: template,
    methods: actionsData
});


export const ValidationErrorsByResource = () => ({
    components: {
        AlertValidationError
    },
    props: {
        message: {
            default: text('name', alertData.message)
        },
        validationErrorsByResource: {
            default: () => object('validationErrorsByResource', alertData.validationErrorsByResource)
        }
    },
    template: template,
    methods: actionsData
});


