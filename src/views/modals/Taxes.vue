<template>
  <div>
    <el-dialog custom-class="fullscreen-modal-display" title="Taxes" :visible.sync="showModal" :modal="true" appendToBody :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect">
      <div class="modal-body taxes">
        <el-row>
          <el-col :sm="12" :md="12">
            <el-switch v-model="settings.sales_tax" @change="updateSettings" active-text="Enable Sales Tax"> </el-switch>
          </el-col>
          <el-col :sm="12" :md="12">
            <el-button :disabled="!settings.sales_tax" class="pull-right" type="success" plain size="small" round @click="addNewTax">Add New Tax</el-button>
          </el-col>
        </el-row>

        <el-divider></el-divider>

        <el-table :data="taxes" v-loading="loading">
          <el-table-column label="Tax name" prop="name"></el-table-column>
          <el-table-column label="Tax">
            <template slot-scope="scope">
              {{ scope.row.value }} %
            </template>
          </el-table-column>
          <el-table-column label="Effective Date">
            <template slot-scope="scope">
              {{ $moment(scope.row.effective_date).format("DD/MM/YYYY") }}
            </template>
          </el-table-column>

          <el-table-column label="All Locations" width="400">
            <template slot-scope="scope">
              <el-row>
                <el-col :sm="6" :md="6">
                  <el-switch v-model="scope.row.all_locations" inactive-color="red" active-color="green" @change="updateTax(scope.row)"> </el-switch>
                </el-col>
                <el-col :sm="18" :md="18">
                  <el-select :disabled="scope.row.all_locations" v-model="scope.row.locationIds" filterable multiple collapse-tags @change="updateTax(scope.row)">
                    <el-option v-for="location in locations" :key="location.id" :label="location.name" :value="location.id"></el-option>
                  </el-select>
                </el-col>
              </el-row>
            </template>
          </el-table-column>

          <el-table-column label="Active">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.active" inactive-color="red" active-color="green" @change="updateTax(scope.row)"> </el-switch>
            </template>
          </el-table-column>

          <el-table-column label="Options">
            <template slot-scope="scope">
              <el-button type="text" @click="editTax(scope.row)">Edit</el-button>
              <el-button type="text" @click="deleteTax()" disabled>Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog :title="'New Sales Tax'" :visible.sync="salesTaxDialog" :close-on-press-escape="true" width="50%" @close="beforeCloseTaxDialog" append-to-body>
        <el-form :model="form" :rules="rules" ref="salesfrm" labelPosition="top">
          <el-row :gutter="40">
            <el-col :sm="24" :md="24" :xs="24">
              <el-form-item label="Name" prop="name">
                <el-input type="text" placeholder="eg. Sales Tax, VAT " v-model="form.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12" :xs="24">
              <el-form-item label="Effective Date" prop="effective_date">
                <el-date-picker v-model="form.effective_date" type="date" placeholder="When tax comes into effect"> </el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12" :xs="24">
              <el-form-item label="Tax" prop="value">
                <el-input type="number" v-model="form.value">
                  <span slot="append">%</span>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="24" :md="24" :xs="24">
              <el-form-item label="Options">
                <el-checkbox v-model="form.active">Active</el-checkbox>
                <el-checkbox v-model="form.all_locations">All Locations</el-checkbox>
              </el-form-item>
            </el-col>

            <el-col :sm="24" :md="24" :xs="24">
              <el-form-item label="Locations" v-if="!form.all_locations">
                <el-select v-model="form.locationIds" filterable multiple collapse-tags>
                  <el-option v-for="location in locations" :key="location.id" :label="location.name" :value="location.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="salesTaxDialog = false" size="small">Cancel</el-button>
          <el-button type="primary" size="small" @click="saveTax()">Save Tax</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SettingsTaxes",
  data() {
    return {
      showModal: false,
      taxes: [],
      locations: [],
      settings: {},
      loading: true,
      salesTaxDialog: false,
      form: {
        name: "",
        effective_date: "",
        value: "",
        all_locations: false,
        locationIds: [],
        active: true
      },
      rules: {
        effective_date: [{ message: "Effective date required", required: true, trigger: "blur" }],
        value: [{ message: "Tax required", required: true, trigger: "blur" }]
      }
    };
  },
  mounted() {
    this.showModal = true;
  },
  created() {
    const getCompany = context => {
      return new Promise((resolve, reject) => {
        context.axios
          .get("/companies/current", { params: { filter: { include: ["settings"] } } })
          .then(res => {
            context.settings = res.data.settings;
            context.locations = res.data.locations;
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    };

    const getTaxes = context => {
      return new Promise((resolve, reject) => {
        context.axios
          .get("/companies/current/taxes")
          .then(res => {
            context.taxes = res.data;
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    };

    (async context => {
      try {
        this.loading = true;
        await getCompany(context);
        await getTaxes(context);
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    })(this);
  },
  methods: {
    reloadTaxes() {
      this.loading = true;
      this.axios
        .get("/companies/current/taxes")
        .then(res => {
          this.taxes = res.data;
        })
        .catch(err => {})
        .finally(_ => {
          this.loading = false;
        });
    },
    settingsRedirect() {
      this.$router.push("/dashboard/settings");
    },
    beforeCloseTaxDialog() {},
    resetForm() {
      this.form = {
        name: "",
        effective_date: "",
        value: "",
        all_locations: false,
        locationIds: [],
        active: true
      };
    },
    updateSettings() {
      this.loading = true;
      this.axios
        .put("/companies/current/settings", this.settings)
        .then(res => {
          this.settings = res.data;
        })
        .catch(err => {})
        .finally(_ => {
          this.loading = false;
        });
    },
    addNewTax() {
      this.resetForm();
      this.salesTaxDialog = true;
    },
    updateTax(tax) {
      this.loading = true;
      this.axios
        .put("/taxes", tax)
        .then(res => {
          this.reloadTaxes();
        })
        .catch()
        .finally(_ => {
          this.loading = false;
        });
    },
    editTax(tax) {
      this.form = tax;
      this.salesTaxDialog = true;
    },
    deleteTax() {},
    saveTax() {
      this.$refs.salesfrm.validate(valid => {
        if (valid) {
          if (this.form.hasOwnProperty("id")) {
            this.axios
              .put("/taxes", this.form)
              .then(res => {
                this.salesTaxDialog = false;
                this.reloadTaxes();
                this.resetForm();
              })
              .catch(err => {})
              .finally(_ => {});
          } else {
            this.axios
              .post("/companies/current/taxes", this.form)
              .then(res => {
                this.salesTaxDialog = false;
                this.reloadTaxes();
                this.resetForm();
              })
              .catch(err => {})
              .finally(_ => {});
          }
        }
      });
    }
  }
};
</script>
<style lang="scss"></style>
