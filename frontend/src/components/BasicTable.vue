<template>
    <div>
<!--        <hot-table :data="data" rowHeaders="true" colHeaders="true"></hot-table>-->
        <hot-table ref="tblRef" :settings="hotSettings"></hot-table>
        <button @click="swapHotData">swap data</button>
    </div>
</template>

<script>

    import { HotTable } from '@handsontable/vue';
    import Handsontable from 'handsontable';

    export default {
        name: 'BasicTable',
        components: {HotTable},
        created() {
            this.initTable();
        },
        data() {
            return {
                // data: [
                //     ["", "Ford", "Volvo", "Toyota", "Honda"],
                //     ["2016", 10, 11, 12, 13],
                //     ["2017", 20, 11, 14, 13],
                //     ["2018", 30, 15, 12, 13]
                // ],
                hotSettings: {
                    readOnly: false,
                    data:  Handsontable.helper.createSpreadsheetData(6, 10),
                    colHeaders:true,
                    contextMenu: {
                        items: {
                            'row_above': {
                                name: 'Insert row above this one (custom name)'
                            },
                            'row_below': {},
                            'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
                            'clear_custom': {
                                name: 'Clear all cells (custom)',
                                callback: function () {
                                    this.clear();
                                }
                            }
                        }
                    }
                },
                hotRef: null
            };
        },
        mounted() {
            this.hotRef = this.$refs.tblRef.hotInstance;
        },
        methods: {
            initTable() {
            },
            swapHotData: function() {
                this.hotRef.loadData([['new', 'data']]);
            }
        }
    }
</script>

<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
