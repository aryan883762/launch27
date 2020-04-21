<template>
  <el-card class="checklist-assignment" style="box-shadow: none">
    <div class="flex-row-reverse">
      <el-button @click="close" plain round size="mini" type="danger">Close</el-button>
    </div>

    <el-divider content-position="left">Available Checklists</el-divider>

    <el-row :gutter="20" v-loading="loading">
      <el-col :key="index" @click.native="selectChecklist(checklist)" style="max-width: 280px;" v-for="(checklist,index) in checklists">
        <el-card :class="{selected : isSelected(checklist)}" class="checklist-card">
          <el-avatar :src="checklist.icon" shape="square"></el-avatar>
          <div class="team-content">
            <span><strong>{{ checklist.name}}</strong></span>
            <span>Tasks: {{checklist.tasks.length}} </span>
            <i class="el-icon-circle-check" v-if="isSelected(checklist)"></i>
          </div>
        </el-card>
      </el-col>

      <el-col v-if="checklists.length == 0">
        <p>No checklists found</p>
      </el-col>
    </el-row>

  </el-card>
</template>


<script>
    export default {
        props: {
            value: {
                type: Array,
                required: true
            },
            bookingId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                checklists: [],
                selected_checklists: '',
                loading: false
            }
        },
        mounted() {
            this.getChecklists()
            this.selected_checklists = this.value
        },
        methods: {
            getChecklists() {
                this.loading = true
                this.axios.get('/companies/current/checklists', {params: {filter: {include: 'tasks'}}})
                    .then(
                        res => {
                            this.checklists = res.data
                        }
                    )
                    .catch(err => {

                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },
            selectChecklist(checklist) {
                if (this.isSelected(checklist)) {
                    for (let x = 0; x < this.selected_checklists.length; x++) {
                        if (checklist.id === this.selected_checklists[x].id) {
                            this.selected_checklists.splice(x, 1)
                            break;
                        }
                    }
                    //add this relationship
                    this.loading = true
                    this.axios.delete('/bookings/' + this.bookingId + '/assigned_checklists/rel/' + checklist.id)
                        .then(res => {

                        })
                        .catch(err => {

                        })
                        .finally(_ => {
                            this.loading = false
                        })
                } else {
                    this.selected_checklists.push(checklist)
                    this.loading = true
                    this.axios.put('/bookings/' + this.bookingId + '/assigned_checklists/rel/' + checklist.id)
                        .then(res => {

                        })
                        .catch(err => {

                        })
                        .finally(_ => {
                            this.loading = false
                        })
                }
            },
            isSelected(checklist) {
                let found = this.selected_checklists.find((ch) => {
                    return ch.id == checklist.id
                })

                return !!(found);
            },
            close() {
                this.$emit("closed");
            },
        }
    }
</script>

<style lang="scss">
  .checklist-assignment {
    .checklist-card {
      position: relative;
      cursor: pointer;

      &.selected {
        background: #fff8e1;
      }

      i.el-icon-circle-check {
        position: absolute;
        right: 10px;
        bottom: 10px;
        font-size: 24px;
      }

      .el-card__body {
        padding: 10px;
        height: 50px;

        .el-avatar {
          float: left;
          margin-right: 5px;
        }

        .team-content {
          width: calc(100% - 58px);
          display: inline-block;

          span:not(.el-rate__item) {
            display: block;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }
  }
</style>
