import { action } from '@storybook/addon-actions';
import { withKnobs, } from '@storybook/addon-knobs';
import BasicTable from '../src/components/BasicTable';

export default {
    title: 'BasicTable',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const tableData = {

}

const template = `<BasicTable />`

export const Default = () => ({
    components: {
        BasicTable
    },
    template: template,
    methods: actionsData
});

