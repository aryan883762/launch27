<template>
  <el-card class="etl">
    <p>Enter your version 1 credentials</p>
    <el-form>
      <el-row :gutter="40">
        <el-col :sm="8">
          <el-form-item label="subdomain">
            <el-input type="text" v-model="subdomain"></el-input>
          </el-form-item>
        </el-col>

        <el-col :sm="8">
          <el-form-item label="email">
            <el-input type="email" v-model="email"></el-input>
          </el-form-item>
        </el-col>

        <el-col :sm="8">
          <el-form-item label="password">
            <el-input type="password" v-model="password"></el-input>
          </el-form-item>
        </el-col>

        <el-col>
          <el-button @click="connectVersion1" round size="small" type="primary"> Connect V1</el-button>
        </el-col>
      </el-row>

      <el-divider>Progress</el-divider>

      <table>
        <tr>
          <td>Bookings</td>
          <td>{{summary.bookings}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>
        </tr>
        <tr>
          <td>Teams</td>
          <td>{{summary.teams}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>
        </tr>
        <tr>
          <td>Customers</td>
          <td>{{summary.customers}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>
        </tr>
        <tr>
          <td>Staff</td>
          <td>{{summary.staff}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>
        </tr>
        <tr>
          <td>Services</td>
          <td>{{summary.services}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>

        </tr>

        <tr>
          <td>Pricing Parameters</td>
          <td>{{summary.services}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>

        </tr>

        <tr>
          <td>Locations</td>
          <td>{{summary.services}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>

        </tr>

        <tr>
          <td>Frequencies</td>
          <td>{{summary.services}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>

        </tr>

        <tr>
          <td>Extras</td>
          <td>{{summary.services}}</td>
          <td>
            <el-progress :percentage="50"></el-progress>
          </td>

        </tr>
      </table>

    </el-form>

    <el-divider></el-divider>


    <el-button @click="startMigration()" size="small" type="warning">Start Migration</el-button>
  </el-card>


</template>


<script>
    import axios from 'axios'

    export default {
        data() {
            return {
                subdomain: "dagadu",
                password: 'taproute',
                email: 'edzordzinam@gmail.com',
                access_token: "",
                summary: {
                    bookings: 0,
                    teams: 0,
                    services: 0,
                    extras: 0,
                    customers: 0,
                    staff: 0
                }
            }
        },
        methods: {
            connectVersion1() {
                axios.post('https://safe2g.launch27.co',
                    {
                        email: this.email,
                        password: this.password
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }).then(res => {
                    this.access_token = res.data.bearer
                })
            },

            getBookingsCount() {

            },

            startMigration() {

            }
        }
    }
</script>


<style lang="scss">
  .etl {
    table {
      width: 70%;

      tr {
        td {
          min-width: 30%;
        }
      }
    }
  }
</style>
