<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display">
            <div class="modal-title-container" slot="title">
                <el-row>
                    <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Services
            </span>
                    </el-col>
                    <el-col :sm="18" :xs="24">
                        <el-button-group class="pull-right">
                            <el-button :class="{ active: $route.name === 'dashboard_settings_services_categories' }" @click="activeTab = 'dashboard_settings_services_categories'" type="text">
                                Service Categories
                            </el-button>
                            <el-button :class="{ active: $route.name === 'dashboard_settings_services_list' }" @click="activeTab = 'dashboard_settings_services_list'" type="text">
                                Services
                            </el-button>
                            <el-button :class="{ active: $route.name === 'dashboard_settings_services_pricing' }" @click="activeTab = 'dashboard_settings_services_pricing'" type="text">
                                Variable Pricing
                            </el-button>
                            <el-button :class="{ active: $route.name === 'dashboard_settings_services_extras' }" @click="activeTab = 'dashboard_settings_services_extras'" type="text">
                                Extras
                            </el-button>
                            <el-button :class="{ active: $route.name === 'dashboard_settings_services_frequencies' }" @click="activeTab = 'dashboard_settings_services_frequencies'" type="text">
                                Frequencies
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>

            <div class="modal-body service-settings-modal">

                <router-view></router-view>

            </div>
        </el-dialog>
    </div>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import ListParameters from "./ListParameters.vue";
    import ListExtras from "./ListExtras.vue";
    import moment from "moment";
    import ListFrequencies from "./ListFrequencies.vue";
    import ListServices from "./ListServices.vue";
    import ListCategories from "./ListCategories";
    import List from "../../dashboard/calendar/List";

    export default {
        components: {
            List,
            SideHelp,
            ListParameters,
            ListExtras,
            ListFrequencies,
            ListServices,
            ListCategories
        },
        name: "SettingsService",
        data() {
            return {
                showModal: false,
                activeTab: "services",
                loading: false
            };
        },
        watch: {
            'activeTab'(val) {
                this.$router.push({name: val, query: {q: this.$route.query.q}})
            }
        },
        created() {
        },
        mounted() {
            this.showModal = true;
        },

        methods: {
            settingsRedirect() {
                if (this.$route.query.q  === 'dashboard_getting_started') {
                    return this.$router.push({name: 'dashboard_getting_started'});
                }
                return this.$router.push({name: 'dashboard_settings'});

            }
        }
    };
</script>
<style lang="scss">
    .modal-body.services {
        .add-service {
            padding-top: 10px;
            padding-right: 10px;
            cursor: pointer;
        }

        .el-button-group {
            margin-top: 10px;
            float: right;

            .el-button {
                margin-left: 20px;
                text-decoration: underline;
            }
        }

        .sub-title {
            margin: 20px 0px;
            display: block;
            font-size: 15px;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            small {
                font-weight: normal;
                font-size: 12px;
                color: $launch-text-color;
            }
        }

        ul.services-list {
            list-style: none;
            padding: 0;

            li {
                padding: 10px;
                display: block;
                cursor: pointer;
                min-height: 40px;

                .service-image,
                .service-content {
                    display: inline-block;
                }

                .service-image {
                    img {
                        width: 32px;
                        height: 32px;
                        margin-right: 5px;
                        /* border-radius : 50%;*/
                    }
                }

                .service-content {
                    width: calc(100% - 50px);

                    p {
                        margin: 0;
                        font-size: 12px;
                        line-height: 1.5;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        max-height: 35px;
                    }
                }

                .service-name {
                    font-weight: 500;
                    color: black;
                    font-size: 12px;
                }

                .service-price {
                    font-weight: bold;
                    font-style: normal;
                }

                &.active {
                    border-left: 4px solid $launch-primary-color;
                    background: $launch-dashboard-bg-color;
                }
            }
        }

        .toggles {
            .el-form-item__label {
                float: none;
            }

            .el-form-item__content {
                border: 1px solid #f3f3f3;
                padding: 10px;
                border-radius: 5px;
            }

            .el-switch__label {
                width: calc(100% - 50px);
                color: black;

                span {
                    font-size: 11px;
                }
            }
        }
    }

    .service-settings-modal {

        .el-table{
            .table-action-btns{
                .el-link{
                    font-size: 12px !important;
                    margin: 0;
                }
            }
        }
        .pagination-footer {
            padding: 0 !important;
            max-width: 1366px;

            .cct {
                width: auto !important;

                .el-pagination.is-background {
                    padding-right: 0 !important;
                }
            }
        }
    }
</style>
