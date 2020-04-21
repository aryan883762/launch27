<template>
    <div ref="editor" v-html="value"></div>
</template>

<script>
    import Quill from 'quill';

    export default {
        name: "html-editor",
        props: {
            value: {
                type: String,
                default: ''
            }
        },

        data() {
            return {
                editor: null
            };
        },

        mounted() {
            this.editor = new Quill(this.$refs.editor, {
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, 4, false] }],
                        ['bold', 'italic', 'underline']
                    ]
                },
                theme: 'bubble',
                formats: ['bold', 'underline', 'header', 'italic']
            });

            this.editor.root.innerHTML = this.value;

            // We will add the update event here
            this.editor.on('text-change', () => {});
        },

        methods: {
            update() {
                this.$emit('input', this.editor.getText() ? this.editor.root.innerHTML : '');
            }
        }
    }
</script>

<style lang="scss">
    @import '~quill/dist/quill.core.css';
</style>

