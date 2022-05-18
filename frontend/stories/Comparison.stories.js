import Comparison from '../src/components/Schema/Comparison';
import {withKnobs, text, boolean} from "@storybook/addon-knobs";

export default {
    title: 'Comparison',
    excludeStories: /.*Data$/,
    decorators: [withKnobs({escapeHTML: false,})],
}

export const actionsData = {}

export const comparisonData = {
    message1: "message\nline2",
    message2: "message\nline1\nline2",
    jsonCompare: false,
}


const template = `<Comparison :left-side-text="message" :right-side-text="message2" :diff-json="jsonCompare"></Comparison>`;

export const Default = () => ({
    components: {
        Comparison
    },
    props: {
        message: {
            default: text('Left Text (Old)', comparisonData.message1)
        },
        message2:{
            default: text('Right Text (New)', comparisonData.message2)
        },
        jsonCompare:{
            default: boolean('JSON Compare', comparisonData.jsonCompare)
        },
    },
    template: template,
    methods: actionsData
});



