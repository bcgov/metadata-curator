import { action } from '@storybook/addon-actions';
import { withKnobs, text } from '@storybook/addon-knobs';
import Title from '../src/components/Title';

export default {
    title: 'Title',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const titleData = {
    name: "Web Curator"
}

const template = `<Title :name="name" />`

export const Default = () => ({
    components: {
        Title
    },
    template: template,
    props: {
        name: {
            default: text('name', titleData.name)
        }
    },
    methods: actionsData
});

export const NoTitle = () => ({
    components: {
        Title
    },
    template: template,
    props: {
        name: {
            default: text('name', '')
        }
    },
    methods: actionsData
});