<template>
    <div>
        <i class="el-icon-caret-top" @click="move('up')" style="font-size: 20px;"></i>
        <i class="el-icon-caret-bottom" @click="move('down')" style="font-size: 20px;"></i>
    </div>
</template>

<script>
    export default {
        name: 'reorder-item',
        props: {
            model: {
                type: String,
                required: true
            },
            item: {
                type: Object,
                required: true
            },
            list: {
                type: Array,
                required: true
            },
            index: {
                type: Number,
                required: true
            }
        },
        methods: {
            move(direction) {

                let other_item

                if (direction === 'up' && this.index > 0) {
                    this.item.ordering = this.index - 1
                    this.list[this.index - 1].ordering = this.index
                    other_item = this.list[this.index - 1]
                } else if (direction === 'down' && this.index < this.list.length - 1) {
                    this.item.ordering = this.index + 1
                    this.list[this.index + 1].ordering = this.index
                    other_item = this.list[this.index + 1]
                } else {
                    return
                }

                this.axios.patch('/' + this.model + '/reorder',
                    {
                        items: [
                            {id: this.item.id, ordering: this.item.ordering},
                            {id: other_item.id, ordering: other_item.ordering}
                        ]
                    })
                    .then(res => {
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.$emit('change')
                    })
            }
        }
    }
</script>