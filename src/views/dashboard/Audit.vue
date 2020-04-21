<template>
  <el-card shadow="never" class="app-section audit">

    <el-row :gutter="20">
      <el-form labelPosition="top">
        <el-col :sm="6">
          <el-form-item label="Choose Type">
            <el-select v-model="revision_type">
              <el-option label="Booking" value="booking"></el-option>
              <el-option label="Services" value="service"></el-option>
              <el-option label="Extras" value="extra"></el-option>
              <el-option label="Pricing Variables" value="pricing_variable"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item label="Select Action">
            <el-radio-group v-model="revision_action">
              <el-radio value="create" label="Create"></el-radio>
              <el-radio value="edit" label="Edit"></el-radio>
              <el-radio value="delete" label="Delete"></el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-form>

    </el-row>

    <el-divider></el-divider>

    <el-table :data="revisions">
      <el-table-column label="Type" prop="table_name"></el-table-column>
      <el-table-column label="Action" prop="action"></el-table-column>
      <el-table-column label="IP Address" prop="ip"></el-table-column>
      <el-table-column label="By Whom">
        <template slot-scope="scope">
          {{scope.row.account ? scope.row.account.first_name : "n/aa"}}
        </template>
      </el-table-column>
      <el-table-column>
        <template>
          <el-button size="mini" type="warning" round>View</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>


<script>
  export default {
    data: () => {
      return {
        revision_type: "booking",
        revision_action: "create",
        revisions: []
      }
    },

    mounted() {
      this.axios.get('/revisions', {params: {filter: {include: "account"}}})
        .then(
          res => {
            this.revisions = res.data
          }
        )
    }
  }
</script>
