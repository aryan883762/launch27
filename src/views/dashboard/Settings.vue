<template>
    <div class="app-section settings padding-1x">
        <el-row :gutter="10" class="setting-row padding-2x divider-3x box-shadow">
            <label class="setup">
                Set up
            </label>
            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'general_settings')">
                <router-link to="/dashboard/settings/company/general">
                    <el-card class="flex-row-center text-center" disabled shadow="hover">
                        <img src="@/assets/svgs/settings/Profile.svg" svg-inline>
                        <h4>Company</h4>
                        <p>Configure your company settings</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'general_settings')">
                <router-link to="/dashboard/settings/account">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Account.svg" svg-inline>
                        <h4>Account</h4>
                        <p>Update your account settings, payment history and plan</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'billing')">
                <router-link to="/dashboard/settings/payments-setup">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/stripe.svg" svg-inline>
                        <h4>Payments Setup</h4>
                        <p>Configure your payment methods</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'api_keys')">
                <router-link to="/dashboard/settings/api-keys">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Integration.svg" svg-inline>
                        <h4>API Keys</h4>
                        <p>Manage your 3rd Party API Keys</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'billing')">
                <router-link to="/dashboard/settings/account?tab=plan">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Billing.svg" svg-inline>
                        <h4>Billing</h4>
                        <p>Choose your plan and update your billing information</p>
                    </el-card>
                </router-link>
            </el-col>


        </el-row>

        <el-row :gutter="10" class="setting-row padding-2x divider-3x box-shadow">
            <label class="configure">
                Configure
            </label>
            <el-col :md="4" :sm="4" :xs="12"
                    v-if="$can('manage', 'configure_booking_form') && $can('manage', 'plan_booking_form')">
                <router-link to="/dashboard/settings/booking_form">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Booking Form.svg" svg-inline>
                        <h4>Booking Form</h4>
                        <p>Configure your booking form</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'general_settings') ">
                <router-link to="/dashboard/settings/booking_spot/setup">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Booking Spot.svg" svg-inline>
                        <h4>Booking Spot</h4>
                        <p>Add and edit your booking spots</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link to="/dashboard/settings/company/settings-and-policies">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/business_settings.svg" svg-inline>
                        <h4>Booking Policies</h4>
                        <p>Set and edit your booking policies</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12"
                    v-if="$can('manage', 'manage_email') && $can('manage', 'plan_email_text_alert')">
                <router-link to="/dashboard/settings/emails">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Emails.svg" svg-inline>
                        <h4>Emails</h4>
                        <p>Edit your outgoing emails</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12"
                    v-if="$can('manage', 'manage_email') && $can('manage', 'plan_email_text_alert')">
                <router-link to="/dashboard/settings/sms-setup">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Text message.svg" svg-inline>
                        <h4>Text Messages</h4>
                        <p>Edit your outgoing SMS messages</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'plan_scheduler')">
                <router-link to="/dashboard/settings/scheduled-tasks">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Schedules.svg" svg-inline>
                        <h4>Schedule Tasks</h4>
                        <p>Edit your scheduled tasks</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link to="/dashboard/settings/wages">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Schedules.svg" svg-inline>
                        <h4>Wages</h4>
                        <p>Edit team wages</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link to="/dashboard/settings/sales-tax">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Sales Tax.svg" svg-inline>
                        <h4>Taxes</h4>
                        <p>Configure your sales tax</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link to="/dashboard/settings/quote">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Quote Form.svg" svg-inline>
                        <h4>Quote Form</h4>
                        <p>Configure your quote form</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'manage_team')">
                <router-link to="/dashboard/settings/company/roles">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/roles.svg" svg-inline>
                        <h4>Roles</h4>
                        <p>Configure company roles</p>
                    </el-card>
                </router-link>
            </el-col>


        </el-row>

        <el-row :gutter="10" class="setting-row padding-2x divider-3x box-shadow">
            <label class="add">
                Add
            </label>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'manage_services')">
                <router-link to="/dashboard/settings/services">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Service.svg" svg-inline>
                        <h4>Services</h4>
                        <p>Configure and add your company’s services</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'general_settings')">
                <router-link to="/dashboard/settings/locations">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Locations.svg" svg-inline>
                        <h4>Locations</h4>
                        <p>Set and configure your company’s locations</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12"
                    v-if="$can('manage', 'manage_discounts') && $can('manage', 'plan_discount_code')">
                <router-link to="/dashboard/settings/promotions/list">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Promotions.svg" svg-inline>
                        <h4>Promotions</h4>
                        <p>Create and edit promotions</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link to="/dashboard/settings/tags">
                    <el-card class="flex-row-center text-center" shadow="hover" style="cursor:not-allowed;">
                        <img src="@/assets/svgs/settings/Tags.svg" svg-inline>
                        <h4>Tags</h4>
                        <p>View the tags used in your business</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'view_revision') && false">
                <!-- <router-link to="/dashboard/settings/audit">-->
                <router-link to="/dashboard/settings/audit">
                    <el-card class="flex-row-center text-center" shadow="hover" style="background : #f3f3f3;">
                        <img src="@/assets/svgs/settings/audit.svg" svg-inline>
                        <h4>Audit</h4>
                        <p>View your audit or history logs...</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'billing')">
                <router-link to="/dashboard/settings/embedded_url">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/settings/Booking Form.svg" svg-inline>
                        <h4>Embedded Url</h4>
                        <p>Config booking url with this documentation</p>
                    </el-card>
                </router-link>
            </el-col>

        </el-row>
    </div>
</template>

<script>
    export default {
        data: () => {
            return {}
        }
    }
</script>

<style lang="scss">
    .app-section.settings {
        .setting-row {
            background: none;

            label {
                &.setup,
                &.configure,
                &.add {
                    font-size: 13px;
                    text-transform: uppercase;
                    display: block;
                    font-weight: 600;
                    margin-bottom: 20px;
                    margin-left: 5px;
                }

                &.setup {
                    color: #ffd514;
                }

                &.configure {
                    color: #1fde16;
                }

                &.add {
                    color: #0fc8ff;
                }
            }

            svg {
                min-height: 50px;
                width: 50px;
                padding-top: 0px;
                display: inline-block;
            }

            .el-card__body {
                width: 100%;
                height: 15rem;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                justify-content: center;

                img {
                    width: 50px;
                    margin: 0 auto;
                    height: 50px;
                }

                h4 {
                    margin-bottom: 0px;
                    line-height: 1.3;
                }
            }

            .el-col {
                /*  width: 20%;*/
                margin-bottom: 1rem;
                line-height: 1.2rem;
            }

            .el-card {
                border: none;
                box-shadow: 1px 5px 11px 0px rgba(0, 0, 0, 0.04);
                height: 200px;

                &:hover,
                &:focus {
                    box-shadow: 1px 5px 11px 0px rgba(0, 0, 0, 0.2);
                }
            }

            p {
                @include rem(font-size, 12px);
            }

            @media only screen and (min-width: 992px) {
                .el-col-md-4 {
                    width: 20%;
                }
            }

            @media only screen and (max-width: 420px) {
                svg {
                }

                p {
                    @include rem(font-size, 11px);
                }
            }
        }
    }
</style>
