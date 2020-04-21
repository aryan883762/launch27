<template>


  <div class=" edit-people">
    <el-card shadow="never" class="edit-people-container">
      <router-view></router-view>
    </el-card>
  </div>

</template>

<script>
    import AddPerson from "./AddPerson.vue";
    import AddTeam from "./AddTeam.vue";
    import Teams from "./Teams.vue";

    export default {
        components: {
            AddPerson,
            AddTeam,
            Teams
        },
        name: "EditPerson",
        data() {
            return {
                showModal: false,
                activeTab: "new_person",
                selectedPerson: false
            };
        },
        watch: {
            '$route'(val) {
                console.log(val)
            }
        },
        mounted() {
            this.showModal = true;

            this.$events.addListener("close-add-person", () => {
                this.showModal = false;
            });

            this.$events.addListener("add-team-member", person => {
                this.selectedPerson = person;
                this.activeTab = "new_person";
            });
        },
        methods: {
            settingsRedirect() {
                this.$router.back();
            }
        }
    };
</script>
<style lang="scss">

  .edit-people-container {
    padding : 0px;
    .el-card__body:first-child {
      padding: 0px;
    }
  }
  .modal-body.edit-people {

  }
</style>
