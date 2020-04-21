<template>
    <el-select placeholder="All locations" v-loading="loading" style="min-width: 240px;" :class="additionalClass" collapse-tags v-if="returnObject" :filterable="filterable" :multiple="multiple" class="filter small" v-model="selectedLocation" value-key="id" @change="locationChanged">
        <el-option-group
                v-for="group in groups"
                :key="group.label"
                :label="group.label">
            <el-option
                    v-for="item in group.options"
                    :key="item.id"
                    :label="item.name"
                    :value="item">
            </el-option>
        </el-option-group>
    </el-select>
    <el-select placeholder="All locations" v-loading="loading" style="min-width: 200px;" :class="additionalClass" collapse-tags v-else-if="!returnObject" :filterable="filterable" :multiple="multiple" class="filter small" v-model="selectedLocation" @change="locationChanged">
        <el-option-group
                v-for="group in groups"
                :key="group.label"
                :label="group.label">
            <el-option
                    v-for="item in group.options"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
            </el-option>
        </el-option-group>
    </el-select>

</template>

<script>
    export default {
        name: 'company-locations',
        props: {
            value: {
                type: [Object, Array, String, Boolean],
                required: true
            },
            multiple: {
                type: Boolean,
                default: false
            },
            returnObject: {
                type: Boolean,
                default: false
            },
            additionalClass: {
                type: String
            },
            filterable: {
                type: Boolean,
                default: false
            },
            startWithDefault: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                locations: [],
                selectedLocation: "",
                loading: false,
                groups: [
                    {
                        label: "Active locations",
                        options: []
                    },
                    {
                        label: "Archived locations",
                        options: []
                    }
                ]
            }
        },
        created() {

            (async () => {
                try {
                    this.loading = true
                    this.locations = (await this.axios.get('/companies/current/locations')).data

                    this.locations.forEach((location) => {
                        if (location.active)
                            this.groups[0].options.push(location)
                        else
                            this.groups[1].options.push(location)
                    })

                    if (!this.value && this.startWithDefault) {
                        this.locations.forEach((location) => {
                            if (location.default) {
                                if (this.returnObject) {
                                    this.selectedLocation = (this.multiple) ? [location] : location
                                } else {
                                    this.selectedLocation = (this.multiple) ? [location.id] : location.id
                                }
                            }

                        })

                        this.$emit('input', this.selectedLocation)
                        this.$emit('change', this.selectedLocation)

                    } else {
                        this.selectedLocation = this.value
                        this.$emit('input', this.selectedLocation)
                        this.$emit('change', this.selectedLocation)
                    }

                    this.loading = false


                } catch (err) {
                    this.loading = false
                }
            })()

        },
        methods: {
            locationChanged(val) {
                this.$emit('input', val)
                this.$emit('change', val)
            }
        }
    }
</script>