import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import Button from '../src/components/Button';

export default {
    title: 'Button',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const ButtonData = {
    icon: "fa-table",
    text: "Table",
    image: "/img/guess-column-properties.svg",
    imageAlt: "guess",
    imageWidth: 30,
    imageHeight: 30,
}

const template = `<Button :icon="icon" :text="text" :image="image" :imageAlt="imageAlt" :imageWidth="imageWidth" :imageHeight="imageHeight" />`

export const IconAndText = () => ({
    components: {
        Button
    },
    template: template,
    props: {
        icon: {
            default: text('icon', ButtonData.icon)
        },
        text: {
            default: text('text', ButtonData.text)
        },
        image: {
            default: text('image', "")
        },
        imageAlt: {
            default: text('imageAlt', "")
        },
        imageWidth: {
            default: number('imageWidth', 0)
        },
        imageHeight: {
            default: number('imageHeight', 0)
        },

    },
    methods: actionsData
});

export const ImageAndText = () => ({
    components: {
        Button
    },
    template: template,
    props: {
        icon: {
            default: text('icon', "")
        },
        text: {
            default: text('text', "Guess")
        },
        image: {
            default: text('image', ButtonData.image)
        },
        imageAlt: {
            default: text('imageAlt', ButtonData.imageAlt)
        },
        imageWidth: {
            default: number('imageWidth', ButtonData.imageWidth)
        },
        imageHeight: {
            default: number('imageHeight', ButtonData.imageHeight)
        },

    },
    methods: actionsData
});

export const TextOnly = () => ({
    components: {
        Button
    },
    template: template,
    props: {
        icon: {
            default: text('icon', "")
        },
        text: {
            default: text('text', ButtonData.text)
        },
        image: {
            default: text('image', "")
        },
        imageAlt: {
            default: text('imageAlt', "")
        },
        imageWidth: {
            default: number('imageWidth', 0)
        },
        imageHeight: {
            default: number('imageHeight', 0)
        },
    },
    methods: actionsData
});

export const ImageOnly = () => ({
    components: {
        Button
    },
    template: template,
    props: {
        icon: {
            default: text('icon', "")
        },
        text: {
            default: text('text', "")
        },
        image: {
            default: text('image', ButtonData.image)
        },
        imageAlt: {
            default: text('imageAlt', ButtonData.imageAlt)
        },
        imageWidth: {
            default: number('imageWidth', ButtonData.imageWidth)
        },
        imageHeight: {
            default: number('imageHeight', ButtonData.imageHeight)
        },
    },
    methods: actionsData
});

export const IconOnly = () => ({
    components: {
        Button
    },
    template: template,
    props: {
        icon: {
            default: text('icon', ButtonData.icon)
        },
        text: {
            default: text('text', "")
        },
        image: {
            default: text('image', "")
        },
        imageAlt: {
            default: text('imageAlt', "")
        },
        imageWidth: {
            default: number('imageWidth', 0)
        },
        imageHeight: {
            default: number('imageHeight', 0)
        },
    },
    methods: actionsData
});

export const ContainedIconAndText = () => ({
    components: {
        Button
    },
    template: '<v-row dense><v-col cols=1>' + template + '</v-col></v-row>',
    props: {
        icon: {
            default: text('icon', ButtonData.icon)
        },
        text: {
            default: text('text', ButtonData.text)
        },
        image: {
            default: text('image', "")
        },
        imageAlt: {
            default: text('imageAlt', "")
        },
        imageWidth: {
            default: number('imageWidth', 0)
        },
        imageHeight: {
            default: number('imageHeight', 0)
        },

    },
    methods: actionsData
});