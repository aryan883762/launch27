<template>
    <el-main class="getting-started">
        <h4 class="text-center">
            Your getting started checklist
        </h4>

        <h3 class="text-center" style="font-weight: 500">
            You are only a few steps away from building a bigger local service business
        </h3>

        <el-progress :percentage="this.setup_progress" :format="format" :status="getStatus()"
                     style="width: 300px;margin:0 auto;"></el-progress>

        <div class="divider-3x"/>

        <el-row :gutter="20">
            <el-col :md="6" :sm="6" class="hidden-sm-and-down">
                <div class="flex-column-center box-shadow border-radius sub-container padding-2x">
                    <img class="avatar-2x "  :src="require('@/assets/testimonial-started.png')" width="64" height="64"/>
                    <p class="text-center">
                        Milestone Post: The end of July concluded our 9th month in business since launch.
                        It also marked the crossing of our first $100k in gross revenue. We are grateful for Rohan’s
                        ability to lead and inspire.

                    </p>

                    <p class="text-center">
                        We would also like to thank those on his team and the countless other members here that have
                        helped along the way. May our growth and learning never cease!
                    </p>

                    <div class="flex-column-center">
                        <strong>Dan Smith</strong>
                    </div>
                </div>
            </el-col>

            <el-col :md="18" :sm="24" :xs="24">
                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/teams.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Create your business profile</h4>
                        <p class="small">
                            Your first task is to set up your business profile including adding your business name and
                            other operating details
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_settings_company_general', query: { q: 'dashboard_getting_started' } }">
                            Change your business name
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_locations', query: { q: 'dashboard_getting_started' } }">
                            Setup your locations
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_booking_spots_setup', query: { q: 'dashboard_getting_started' } }">
                            Setup your operating hours
                        </router-link>
                    </el-col>
                </el-row>

                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/business.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Customize your Business Portal</h4>
                        <p class="small">
                            Upload your logo, set your business colors and edit your policies and procedures
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_settings_company_general', query: { q: 'dashboard_getting_started' } }">
                            Upload logo
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_company_policies', query: { q: 'dashboard_getting_started' } }">
                            Edit Policy and Procedures
                        </router-link>
                    </el-col>
                </el-row>

                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/document.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Create your Services and Checklists</h4>
                        <p class="small">
                            Create and configure your services, pricing variables, frequencies and service extras.
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_settings_services_list', query: { q: 'dashboard_getting_started' } }"
                                type="text">
                            Configure your services
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_services_pricing', query: { q: 'dashboard_getting_started' } }"
                                type="text">
                            Service Pricing Variables
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_services_extras', query: { q: 'dashboard_getting_started' } }"
                                type="text">
                            Setup Service Extras
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link :to="{ name: 'dashboard_checklists', query: { q: 'dashboard_getting_started' } }"
                                     type="text">
                            Add Checklists
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_settings_services_frequencies', query: { q: 'dashboard_getting_started' } }"
                                type="text">
                            Add Frequencies
                        </router-link>
                    </el-col>
                </el-row>

                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/pink_card.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Get Everyone Onboard</h4>
                        <p class="small">
                            Send out invites to teams, other admins and even your customers so that they can easily
                            onboard
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_people_add', query: { q: 'dashboard_getting_started', team: true } }"
                                type="text">
                            Invite your teams
                        </router-link>
                        <el-divider direction="vertical"></el-divider>
                        <router-link
                                :to="{ name: 'dashboard_people_add', query: { q: 'dashboard_getting_started', customer: true } }"
                                type="text">
                            Invite Customers
                        </router-link>
                    </el-col>
                </el-row>

                <!--<el-row class="started-item flex-row-center divider-1x border-shadow">
                  <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                    <img svg-inline src="@/assets/svgs/get-started/booking_form.svg" />
                  </el-col>
                  <el-col :sm="24" :md="24" :xs="24" class="content-holder">
                    <h4>Customize Your Booking Form</h4>
                    <p class="small">
                      Choose the look and feel of the form you embed on your website.
                    </p>
                    <el-button type="text">
                      Add Customer Fields
                    </el-button>
                    <el-button type="text">
                      Choose a Booking Form
                    </el-button>
                  </el-col>
                </el-row>-->

                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/payment.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Set Payment Gateways</h4>
                        <p class="small">
                            How would you like to get paid?
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_settings_payments_setup', query: { q: 'dashboard_getting_started' } }"
                                type="text">
                            Choose Payment Processor
                        </router-link>
                    </el-col>
                </el-row>

                <el-row class="started-item flex-row-center divider-1x border-shadow">
                    <el-col :sm="4" class="flex-column-center icon-holder  hidden-sm-and-down ">
                        <img src="@/assets/svgs/get-started/chooseplan.svg" svg-inline/>
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24" class="content-holder">
                        <h4>Choose A Plan</h4>
                        <p class="small">
                            Ready to make it official? Upgrade to a paid plan.
                        </p>
                        <router-link
                                :to="{ name: 'dashboard_settings_account', query: { q: 'dashboard_getting_started', tab: 'plan' } }"
                                type="text">
                            Upgrade Now
                        </router-link>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </el-main>
</template>

<script>
    export default {
        data: () => {
            return {
                setup_progress: 0,
                setup_progress_visits: []
            };
        },
        mounted() {
            //get progres
            this.axios.get('/companies/current', {
                params: {
                    filter: {
                        include: [],
                        fields: ['id', 'setup_progress', "setup_progress_visits"]
                    }
                }
            })
                .then(res => {
                    this.setup_progress = res.data.setup_progress
                    this.setup_progress_visits = res.data.setup_progress_visits
                })
        },
        methods: {
            format(percentage) {
                return percentage === 100 ? '100%' : `${percentage}%`;
            },
            getStatus() {
                if (this.setup_progress > 0 && this.setup_progress < 70) {
                    return 'warning'
                }

                if (this.setup_progress >= 70 && this.setup_progress <= 100) {
                    return 'success'
                }

            }
        }
    };
</script>

<style lang="scss">
    @import "theme/GettingStarted";
</style>
