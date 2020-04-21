<template>
  <el-row>
    <el-col :sm="16" class="no-users">
      <h4>SMS & Email Template Management</h4>
      <p>Select a template on the left to amend it to your business needs </p>


    </el-col>

    <side-help :show_border="false"></side-help>

  </el-row>
</template>

<script>
    import SideHelp from "../../views/components/SideHelp";

    export default {
        components: {
            SideHelp
        }

    }
</script>
