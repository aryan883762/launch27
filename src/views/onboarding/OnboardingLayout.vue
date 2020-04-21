<template>
    <div>
        <el-container :class="illustration" class="page onboarding">
            <el-main>
                <el-row :gutter="0" class="divider-3x" style="margin-top: 20px;">

                </el-row>

                <el-row class="flex-row-center">
                    <el-col :md="8" :sm="8" :xs="24" class="text-center hidden-sm-and-down" style="min-height: 530px;">
                        <el-col>
                            <router-link style="margin-bottom: 40px;text-align: left; display:block;" to="/">
                                <svg height="24px" width="135px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <image
                                            height="24px"
                                            width="135px"
                                            x="0px"
                                            xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                            y="0px"
                                    />
                                </svg>
                            </router-link>
                        </el-col>
                        <fade-transition :duration="250" mode="out-in" origin="center">
                            <img class="img-illustration" src="@/assets/svgs/onboarding/ill_company.svg" v-if="illustration == 'company'"/>
                            <img class="img-illustration" src="@/assets/svgs/onboarding/ill_services.svg" v-if="illustration == 'services'"/>
                            <img class="img-illustration" src="@/assets/svgs/onboarding/ill_opening.svg" v-if="illustration == 'opening'"/>
                            <img class="img-illustration" src="@/assets/svgs/onboarding/ill_teams.svg" v-if="illustration == 'teams'"/>
                            <img class="img-illustration" src="@/assets/svgs/onboarding/ill_getting_started.svg" v-if="illustration == 'getting_started'"/>
                        </fade-transition>
                    </el-col>

                    <el-col :md="16" :sm="16" :xs="24" style="min-height: 530px;">

                        <fade-transition :duration="250" mode="out-in" origin="center">
                            <router-view/>
                        </fade-transition>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import {redirectWithSubdomain} from "@/utils/subdomain_helper.js";

    export default {
        data: () => {
            return {
                illustration: "company",
                current_step: 1,
                loading: false
            };
        },

        created() {
            this.$events.addListener("illustration", (illustration, step) => {
                this.illustration = illustration;
                this.current_step = step;
            });

            this.$events.addListener("onboarding-get-started", () => {
                this.quickSetup()
                this.$router.push({name: "onboarding_started"});
            });


            this.$events.addListener("onboarding-next", () => {
                this.next();
            });

            this.$events.addListener("onboarding-prev", () => {
                this.prev();
            });

            this.$events.addListener("onboarding-quick", () => {
                this.quickSetup();
            });
        },
        beforeDestroy() {
            this.$events.removeListener("onboarding-illustration");
        },
        methods: {
            next() {
                this.loading = true
                switch (this.illustration) {
                    case "company":
                        this.current_step = 2;
                        this.axios
                            .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {company_setup: true})
                            .then(res => {
                                this.$auth.fetch({
                                    params: {},
                                    success: () => {
                                        this.$router.push({name: "onboarding_services"});
                                        redirectWithSubdomain(this.$subdomain.name);
                                    }
                                });
                            })
                            .catch(err => {
                            })
                            .finally(() => {
                                this.loading = false
                            })
                        break;

                    case "services":
                        this.$router.push({name: "onboarding_teams"});
                        this.current_step = 3;
                        this.axios
                            .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {services: true})
                            .then(res => {
                                this.$auth.fetch();
                            })
                            .catch(err => {
                            })
                            .finally(() => {
                                this.loading = false
                            })
                        break;

                    case "opening":
                        this.$router.push({name: "onboarding_teams"});
                        this.current_step = 4;
                        this.axios
                            .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {opening: true})
                            .then(res => {
                                this.$auth.fetch();
                            })
                            .catch(err => {
                            })
                            .finally(() => {
                                this.loading = false
                            })
                        break;

                    case "teams":
                        this.$router.push({name: "onboarding_started"});
                        this.current_step = 5;
                        this.axios
                            .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {teams: true})
                            .then(res => {
                                this.$auth.fetch();
                            })
                            .catch(err => {
                            })
                            .finally(() => {
                                this.loading = false
                            })
                        break;

                    default :
                        this.loading = false;
                        break;
                }
            },

            prev() {
                switch (this.illustration) {
                    case "getting_started":
                        this.$router.push({name: "onboarding_teams"});
                        this.current_step = 4;
                        break;

                    case "teams":
                        this.$router.push({name: "onboarding_services"});
                        this.current_step = 3;
                        break;

                    case "opening":
                        this.$router.push({name: "onboarding_services"});
                        this.current_step = 2;
                        break;

                    case "services":
                        this.$router.push({name: "onboarding_company"});
                        this.current_step = 1;
                        break;
                }
            },

            quickSetup() {
                this.loading = true
                this.axios
                    .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {
                        company_setup: true,
                        services: true,
                        opening: true,
                        teams: true,
                        complete: true
                    })

                    .then(res => {
                        this.$auth.fetch();
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    };
</script>
