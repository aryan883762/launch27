<template>
    <!-- <el-select class="filter small no-border"
      v-model="search" filterable clearable remote placeholder="Search"
      :remote-method="startSearch" :loading="loading" @change="gotoModel">
      <el-option v-for="result in results"
        :key="result._id"
        :label="result.display"
        :value="result._id">
      </el-option>
    </el-select> -->

    <el-autocomplete
            class="search-input"
            popper-class="global-search-autocomplete"
            v-model="search"
            placeholder="Search for bookings, accounts, services and more..."
            @select="gotoModel"
            prefix-icon="el-icon-search"
            :fetch-suggestions="startSearch"
            :trigger-on-focus="false">
        <template slot-scope="{ item }">
            <el-avatar class="pull-left" :size="32" shape="square" v-if="item._source.model !=='account'"></el-avatar>
            <account-avatar style="margin-right: 10px;" body-class="pull-left" :account="{fullname: item.display_text}" :size="32" v-if="item._source.model ==='account'"></account-avatar>
            <div class="search-element">
                <div class="flex-row">
                    <strong>{{item.display_text}}</strong>
                    <label>{{ formatModel(item._source.model) }}</label>
                </div>
                <label>created at {{ formatDate(item._source .created_at) }}</label>
            </div>
        </template>
    </el-autocomplete>

</template>
<script>
    import AccountAvatar from "./AccountAvatar";

    export default {
        components: {AccountAvatar},
        data() {
            return {
                search: "",
                loading: false,
                results: [],
                mapper: {
                    account: "dashboard_profile_appointments",
                    booking: "dashboard_booking_view",
                    location: "dashboard_settings_locations",
                    address: "profile_address",
                    checklist: "dashboard_checklists_edit",
                    tag: "dashboard_settings_tag_detail",
                    frequency: "dashboard_settings_frequency_edit",
                    service: "dashboard_settings_services_edit",
                    tax: "dashboard_settings_sales_tax_report",
                    discount_code: "dashboard_settings_promotions_edit",
                    note: "profile_notes",
                    team: "dashboard_people_edit_team",
                }

            };
        },
        created() {
        },
        methods: {
            startSearch(search, cb) {
                this.results = [];
                if (search === "") {
                    return;
                }
                this.loading = true;

                this.axios.post('/elastic_search/search', {query: search})
                    .then(res => {
                        if (res.data) {
                            this.results = res.data.results;
                            cb(this.results);
                        }
                        this.loading = false;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle("Search is Unavailable, Please try later!");
                        this.loading = false;
                        cb(this.results);
                    });
            },
            gotoModel(result) {
                switch (result._source.model) {
                    case "account":
                        this.$router.push({name: this.mapper.account, params: {id: result._id}});
                        break;
                    case "booking":
                        this.$router.push({
                            name: this.mapper.booking,
                            params: {id: result._id, service_date: result._source.service_date}
                        })
                        break;
                    case "location":
                        this.$router.push({name: this.mapper.location, params: {id: result._id}});
                        break;
                    case "address":
                        this.$router.push({name: this.mapper.address, params: {id: result._source.account.id}});
                        break;
                    case 'checklist':
                        this.$router.push({name: this.mapper.checklist, params: {id: result._id}});
                        break;
                    case 'tag':
                        this.$router.push({name: this.mapper.tag, params: {id: result._id}});
                        break;
                    case 'frequency':
                        this.$router.push({name: this.mapper.frequency, params: {id: result._id}});
                        break;
                    case 'service':
                        this.$router.push({name: this.mapper.service, params: {id: result._id}});
                        break;
                    case 'tax':
                        this.$router.push({name: this.mapper.tax, params: {id: result._id}});
                        break;
                    case 'discount_code':
                        this.$router.push({name: this.mapper.discount_code, params: {id: result._id}});
                        break;
                    case 'note':
                        this.$router.push({name: this.mapper.note, params: {id: result._source.account.id}});
                        break;
                    case 'team':
                        this.$router.push({name: this.mapper.team, params: {id: result._id}});
                        break;
                    default:
                        break;
                }
            },
            getResultFromId(id) {
                var res = null;
                for (var i = 0; i < this.results.length; i++) {
                    if (this.results[i]._id === id) {
                        res = this.results[i];
                        break;
                    }
                }
                return res;
            },
            formatDate(date) {
                return this.$moment(date).format(this.$date_format + " " + this.$time_format);
            },
            formatModel(model) {
                model = model.replace(/_/g, ' ');
                var splitStr = model.toLowerCase().split(' ');
                for (var i = 0; i < splitStr.length; i++) {
                    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                }
                return splitStr.join(' ');
            }
        }
    };
</script>

<style lang="scss">

    .global-search-autocomplete {
        max-width: 500px;
        width: 500px !important;

        .el-autocomplete-suggestion__wrap {
            padding-top: 0px;
            padding-bottom: 0px;
        }

        li {
            padding: 10px 15px !important;

            label {
                line-height: 1.3;
            }

            .el-avatar {
                margin-right: 10px;
                background: #f1f1f1;
                color: #333333;
            }
        }
    }

    .search-input {
        width: 400px;

        margin-left: 16px;

        input {
            box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
            border: none !important;

        }
    }

    .search-element {
        font-size: 12px;
        line-height: initial;
    }
</style>
