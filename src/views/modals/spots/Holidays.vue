<template>
    <div class="">

        <el-card style="margin-bottom: 5px;">
            <el-row>
                <el-col :sm="12" class="bg-white">
                    Set your public holidays.
                    <div class="divider"></div>
                </el-col>
                <el-col :sm="12">
                    <el-button @click="holidayDialog  = true" class="pull-right" plain round size="mini"
                               style="margin-left: 10px;" type="success"> Add a holiday
                    </el-button>

                    <el-select @change="changeLocation" class="filter small pull-right" placeholder="Locations"
                               style="width: 300px;" v-model="filter_location">
                        <el-option label="All" value="all">
                            All
                        </el-option>
                        <el-option :key="location.id" :label="location.name" :value="location.id"
                                   v-for="location in locations">
                            {{ location.name }}
                        </el-option>
                    </el-select>
                </el-col>
            </el-row>
        </el-card>

        <div class="bg-white padding-2x">
            <el-tabs @tab-click="changeTab" v-model="activeName">
                <el-tab-pane name="company_holiday">
                    <span slot="label">Your Holidays</span>
                    <el-table :data="company_holidays" v-loading="loading">
                        <el-table-column label="Holiday" prop="name"></el-table-column>
                        <el-table-column label="Date" prop="date">
                            <template slot-scope="scope">
                                {{ $moment(scope.row.start).format($date_format) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Location">
                            <template slot-scope="scope">
                              <span v-if="scope.row.locations && scope.row.locations.length > 0">
                                 <el-tag size="mini" style="margin-bottom: 4px;"
                                         v-for="location in scope.row.locations">{{location.name}}</el-tag>
                              </span>
                                <span v-else>All</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="Add">
                            <template slot-scope="scope">
                                <el-link @click="editHoliday(scope.row)" plain round size="mini" type="primary">Edit
                                </el-link>
                                <el-divider direction="vertical"></el-divider>
                                <el-link @click="removeHoliday(scope.row.id)" plain round size="mini" type="danger">
                                    Remove
                                </el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane name="available">
                    <span slot="label">Available Holidays</span>
                    <el-table :data="holidays" v-loading="loading">
                        <el-table-column label="Holiday" prop="name"></el-table-column>
                        <el-table-column label="Date" prop="date">
                            <template slot-scope="scope">
                                {{ $moment(scope.row.start).format($date_format) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Type" prop="type"></el-table-column>
                        <el-table-column label="Add">
                            <template slot-scope="scope">
                                <el-button @click="selectHoliday(scope.row)" plain round size="mini" type="success">
                                    Choose
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <el-dialog :modal="true" :visible.sync="holidayDialog" append-to-body title="Add a holiday" width="30%" top="0vh">
                <div class="modal-body">
                    <el-form :model="holiday" :rules="rules" label-position="top" ref="holidayfrm">
                        <el-form-item label="Name" prop="name">
                            <el-input v-model="holiday.name"></el-input>
                        </el-form-item>


                        <el-form-item label="Date" prop="start">
                            <el-date-picker value-format="yyyy-MM-dd" v-model="holiday.start"></el-date-picker>
                        </el-form-item>

                        <el-form-item label="Location (if required)">
                            <el-select multiple v-model="holiday.locationIds">
                                <el-option :key="location.id" :label="location.name" :value="location.id"
                                           v-for="location in locations">
                                    {{ location.name }}
                                </el-option>
                            </el-select>
                        </el-form-item>

                    </el-form>
                </div>
                <div slot="footer">
                    <el-button @click="holidayDialog= false" round size="small">Cancel</el-button>
                    <el-button :loading="add_loading" @click="saveHoliday()" round size="small" type="primary">Save
                        Holiday
                    </el-button>
                </div>
            </el-dialog>
        </div>


    </div>
</template>

<script>
    export default {
        data: () => {
            return {
                holidays: [],
                company_holidays: [],
                loading: false,
                activeName: "company_holiday",
                holidayDialog: false,
                filter_location: '',
                locations: [],
                holiday: {},
                rules: {
                    name: [{message: "Holiday name is required", required: true}],
                    start: [{message: "Date is required", required: true}]
                },
                add_loading: false
            };
        },
        mounted() {
            (async context => {
                try {
                    context.loading = true;
                    await this.getDefaultHolidays(context);
                    await this.getCompanyHolidays(context);
                    this.locations = (await this.axios.get('/companies/current/locations', {
                        params: {
                            filter: {
                                where: {
                                    active: true
                                }
                            }
                        }
                    })).data
                    context.loading = false;
                } catch (err) {
                    context.loading = false;
                }
            })(this);
        },

        methods: {
            changeTab($event) {
                if ($event.name === "company_holiday") {
                    this.getCompanyHolidays(this)
                        .then()
                        .catch();
                } else {
                    this.getDefaultHolidays(this)
                        .then()
                        .catch();
                }
            },
            editHoliday(holiday) {
                this.holiday = holiday
                this.holidayDialog = true
            },
            changeLocation(val) {
                if (val === 'all') {
                    this.axios
                        .get("/companies/current/holidays",
                            {
                                params: {
                                    filter: {
                                        "include": {
                                            "relation": "locations",
                                            "scope": {
                                                "fields": {"id": true, "name": true}
                                            }
                                        },
                                    }
                                }
                            })
                        .then(res => {
                            this.company_holidays = res.data;
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        });
                } else {
                    this.axios
                        .get("/companies/current/holidays", {
                            params: {
                                filter: {
                                    "include": {
                                        "relation": "locations",
                                        "scope": {
                                            "fields": {"id": true, "name": true}
                                        }
                                    },
                                    where: {locationIds: this.filter_location}
                                }
                            }
                        })
                        .then(res => {
                            this.company_holidays = res.data;
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        });
                }
            },

            saveHoliday() {

                this.$refs.holidayfrm.validate((valid) => {
                    if (valid) {
                        this.add_loading = true

                        this.holiday.start = this.$root.getUTCDate(this.holiday.start)

                        if (this.holiday.id) {
                            this.axios.put("/companies/current/holidays/" + this.holiday.id, this.holiday)
                                .then(res => {
                                    this.$message.success("Holiday updated");
                                    this.holiday = {}
                                    this.holidayDialog = false
                                    this.getCompanyHolidays(this)
                                        .then()
                                        .catch();
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.add_loading = false
                                })
                        } else {
                            this.axios.post("/companies/current/holidays", this.holiday)
                                .then(res => {
                                    this.$message.success("Holiday added");
                                    this.holiday = {}
                                    this.holidayDialog = false
                                    this.getCompanyHolidays(this)
                                        .then()
                                        .catch();
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.add_loading = false
                                })
                        }


                    }
                })

            },

            removeHoliday(id) {
                this.axios.delete("/companies/current/holidays/" + id).then(res => {
                    this.$message.success("Holiday removed");
                    this.getCompanyHolidays(this)
                        .then()
                        .catch();
                });
            },

            isSelect(holiday) {
                return true;
            },

            selectHoliday(holiday) {
                this.axios.post("/companies/current/holidays", holiday).then(res => {
                    this.$message.success("Holiday added");
                    this.getDefaultHolidays(this)
                        .then()
                        .catch();
                });
            },

            getDefaultHolidays(context) {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get("/public_holidays/default")
                        .then(res => {
                            context.holidays = res.data;
                            resolve(res.data);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            },

            getCompanyHolidays(context) {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get("/companies/current/holidays", {
                            params: {
                                filter: {
                                    "include": {
                                        "relation": "locations",
                                        "scope": {
                                            "fields": {"id": true, "name": true}
                                        }
                                    }
                                }
                            }
                        })
                        .then(res => {
                            context.company_holidays = res.data;
                            resolve(res.data);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            }
        }
    };
</script>
