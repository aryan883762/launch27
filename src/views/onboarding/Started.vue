<template>
    <div>

        <onboarding-steps current_step="3" illustration="getting_started"></onboarding-steps>

        <h1 class="center text-center divider" style="font-size : 2.5rem; margin-top : 5rem">
            Congrats {{$auth.user().first_name}}! <br/>
            <small>You are ready to Launch.</small>
        </h1>

        <!--<div class="divider-3x" style="margin-bottom: 6rem"/>-->
        <p class="center text-center">We can't wait to see how you grow your business with launch27... dive right in below</p>
        <div class="center text-center" style="margin-top: 20px">
            <el-button @click="completeOnboarding(2)" round type="warning" style="width: 200px;">
                Get Started Checklist
            </el-button>
        </div>
        <p class="center text-center" style="max-width: 630px; margin-top: 50px;">
            From our experience, we realize some people may need a little more help getting started. You can <a
                href="https://calendly.com/launch27_demo" target="_blank">SCHEDULE A 1-ON-1 CALL</a> with a member of our customer success team to get started or you can use a handy <a
                @click="completeOnboarding(2)" style="border-bottom: 1px solid; color: black;">GET STARTED LIST</a> to jump right in.
        </p>
    </div>
</template>

<script>
    import OnboardingSteps from "./OnboardingSteps";
    import {redirectWithSubdomain} from "@/utils/subdomain_helper.js";

    export default {
        components: {OnboardingSteps},
        data: () => {
            return {};
        },

        mounted() {
            this.$events.emitEvent("illustration", ["getting_started", 5]);
        },
        methods: {
            completeOnboarding(index) {
                this.axios
                    .patch("/onboardings/" + this.$auth.user().company.onboarding.id, {complete: true})
                    .then(res => {
                        this.$auth.fetch({
                            params: {},
                            success: () => {
                                if (index === 1) {
                                    console.log("scheduler");
                                } else if (index === 2) {
                                    this.$router.push({name: "dashboard_getting_started"});
                                    redirectWithSubdomain(this.$subdomain.name);
                                } else if (index === 3) {
                                    this.$router.push({name: "dashboard"});
                                    redirectWithSubdomain(this.$subdomain.name);
                                }
                            }
                        });
                    })
                    .catch(err => {
                    });
            }
        }
    };
</script>
