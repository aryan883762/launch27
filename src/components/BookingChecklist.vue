<template>
  <div class="booking-assigned-view-checklist">
    <vcl-list height="150" v-if="loading"></vcl-list>
    <el-row class="checklist-li" v-for="(checklist, checklistIndex) in checklists" :key="checklistIndex" v-if="!loading">
      <el-col>
        <el-row class="wd-tab-checklist-title">
          <el-col :md="12">
            <p style="color:black; margin:0px;"><strong>{{checklist.name}}</strong></p>
          </el-col>
          <el-col :md="12">
            <p style="color:black; margin:0px;">Duration: {{checklist.duration | duration}}</p>
          </el-col>
          <el-col>
            <el-divider></el-divider>
          </el-col>
        </el-row>


        <el-row>
          <ul>
            <li v-for="task in checklist.tasks">
              <el-col :md="24" class="check-main">
                <el-checkbox v-model="task.completed"><strong>Task: </strong>{{task.name}}</el-checkbox>
              </el-col>
              <el-col :md="24" class="check-sub" v-for="(subtask, subtaskIndex) in task.subtasks" :key="subtaskIndex">
                <span class="sub-title"><el-checkbox style="margin-right: 10px;" v-model="subtask.completed"></el-checkbox> {{subtask.name}}  </span>
              </el-col>
              <el-col class="" style="padding: 10px 20px;">
                <el-avatar :size="48" :src="pic" class="image" shape="square" style="margin-right: 10px; box-shadow:rgb(51, 51, 51) 0px 0px 3px" v-for="(pic, index) in task.pictures" :key="index" />
              </el-col>
            </li>
          </ul>
        </el-row>
      </el-col>

    </el-row>

    <p v-if="checklists.length === 0 && !loading">
      No checklist assigned to this booking
    </p>

  </div>
</template>


<script>
    import {VclList} from 'vue-content-loading'

    export default {
        components: {
            VclList
        },
        props: {
            bookingId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                checklists: [],
                loading: true
            }
        },
        mounted() {
            this.loadAssignedChecklist()
        },
        methods: {
            loadAssignedChecklist() {
                this.loading = true
                this.axios.get('/bookings/' + this.bookingId + '/assigned_checklists', {
                    params: {
                        filter: {
                            include: ["tasks"]
                        }
                    }
                })
                    .then(res => {
                        this.checklists = res.data
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false
                    })
            }
        }
    }
</script>

<style lang="scss">
  .booking-assigned-view-checklist {
    .wd-tab-checklist-title {
      margin: 0 auto;
    }

    .checklist-li {
      &:nth-child(even) {

      }
    }

    .el-divider {
      margin: 5px 0px;
    }

    ul {
      padding: 0px;
      display: block;
      cursor: pointer;
      margin: 0 auto;
      overflow-y: scroll;

      li {


        overflow: hidden;
        margin-bottom: 10px;

        .check-main {
          margin-bottom: 10px;

          .el-checkbox {
            .el-checkbox__label {
              color: black;
            }
          }
        }

        .check-sub {
          .sub-title {
            padding-left: 20px;
          }

          .sub-check {
            .el-checkbox {
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
</style>
