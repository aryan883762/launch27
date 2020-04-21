<template>
    <div>
        <el-card :body-style="{ padding: '10px' }" style="margin-bottom: 5px;">
            <el-page-header @back="$router.back()" content="Accounts import"></el-page-header>
        </el-card>

        <el-row :gutter="10">
            <el-col :md="16" :sm="16">
                <el-card>
                    <el-row>
                        <el-col>
                            <strong> Step 1: Export Customer Data from your current system </strong>
                            <p>Export the customer data from your current system as a CSV file (.csv)</p>
                        </el-col>

                        <el-col>
                            <strong>Step 2: Import your Data</strong>
                            <p>Click Choose File, upload the CSV file containing your customer data that you exported from your system and click Import.</p>

                            <el-divider></el-divider>
                            <vue-csv-import
                                    :headers="true"
                                    :map-fields="fields"
                                    :required-fields="['email', 'first_name', 'last_name']" :role="role" :callback="importSuccess" load-btn-text="Next - choose field mappings" url="/accounts/import" v-model="csv"></vue-csv-import>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <side-help></side-help>
        </el-row>
    </div>

</template>


<script>


    import VueCsvImport from "../../../components/VueCsvImport";
    import SideHelp from "../../components/SideHelp";

    export default {
        components: {
            SideHelp,
            VueCsvImport

        },
        data() {
            return {
                fields: ['email', 'first_name', 'last_name', 'phone', 'company_name'],
                csv: [],
                role: ''
            }
        },
        mounted() {
            if (this.$route.query.hasOwnProperty('customer')) {
                this.role = 'r_customer'
            }

            if (this.$route.query.hasOwnProperty('team')) {
                this.role = 'r_team'
            }

            if (this.$route.query.hasOwnProperty('marketer')) {
                this.role = 'r_marketing'
            }

            if (this.$route.query.hasOwnProperty('accountant')) {
                this.role = 'r_accountant'
            }

            if (this.$route.query.hasOwnProperty('staff')) {
                this.role = 'r_staff'
            }

            if (this.$route.query.hasOwnProperty('developer')) {
                this.role = 'r_developer'
            }

            if (this.$route.query.hasOwnProperty('admin')) {
                this.role = 'r_admin'
            }
        },
        methods: {
            getURL() {
                return ''
            },
            importSuccess() {
                console.log('completed')
                this.$alert('Your file has been queued for processing. You would receive when process is completed.')
                this.$router.push({name: "dashboard_people_appointments"})
            }
        }
    }
</script>


<style lang="scss">

</style>