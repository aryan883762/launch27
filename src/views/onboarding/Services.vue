<template>
  <el-form class="" :model="services_form" ref="services_form" :rules="rules">
    <div class="divider-1x">
      <h2>Welcome {{ $auth.user().first_name }}</h2>
    </div>

    <p>You are only a few minutes away from building bigger business with Launch27 <br />Next, lets set your services (don’t worry if you are not ready you can skip it and come back to it)</p>

    <el-card>
      <el-row :gutter="40">
        <el-col :sm="12" :md="12">
          <el-form-item prop="name">
            <el-input v-model="services_form.name" placeholder="Service Name" />
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6">
          <el-form-item prop="price">
            <el-input v-model="services_form.price" placeholder="Service Price" />
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6">
          <el-form-item prop="price">
            <el-button size="mini" type="info" @click="saveService()">
              Add New Service
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-table :data="services" v-loading="loading">
        <el-table-column label="Service name">
          <template slot-scope="scope">
            <el-input style="margin: 5px;" v-model="scope.row.name" placeholder="Service Name" @change.native="updateService(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="Base price">
          <template slot-scope="scope">
            <el-input type="number" v-model="scope.row.base_price" placeholder="Service Price" @change.native="updateService(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="Option">
          <template slot-scope="scope">
            <el-button type="mini" icon="el-icon-delete" round @click="deleteService(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="divider" />
    <el-row>
      <el-col :sm="12" :md="12" :xs="24" class="button-container">
        <el-button type="text" plain @click="prev">
          Back
        </el-button>
      </el-col>
      <el-col :sm="12" :md="12" :xs="24" class="button-container">
        <div class="pull-right">
          <el-button type="primary" round @click="next" :loading="$parent.loading">
            Next
          </el-button>
          <el-button type="primary" round @click="skip" :loading="$parent.loading">
            Skip
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  data: () => {
    return {
      services_form: {
        name: "",
        location: "",
        price: ""
      },
      services: [],
      activeCompany: false,
      rules: {
        name: [{ required: true, trigger: "blue" }],
        price: [{ required: true, trigger: "blue" }],
        location: [{ required: true, trigger: "blue" }]
      },
      loading: false
    };
  },

  created() {
    if (this.$auth.user().company) {
      this.activeCompany = this.$auth.user().company;

      // delete some fields from company form

      this.services_form.location = this.activeCompany.locations[0].id;

      // get company service
      this.axios
        .get("/locations/" + this.services_form.location + "/services")
        .then(res => {
          this.services = res.data;
        })
        .catch(err => {
          console.log(err);
        });
    }
  },

  mounted() {
    this.$events.emitEvent("illustration", ["services", 2]);
  },
  methods: {
    prev() {
      this.$events.emitEvent("onboarding-prev");
    },
    next() {
      this.$events.emitEvent("onboarding-next");

      /* if (this.services.length === 0) {
            this.$confirm('Are you sure you want to proceed without adding any services?', 'Warning', {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              type: 'warning'
            })
              .then(() => {
                this.$events.emitEvent('onboarding-next')
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            this.$events.emitEvent('onboarding-next')
          } */
    },
    skip(){
        this.$events.emitEvent("onboarding-next");
    },

    reloadServices() {
      // get company service
      this.axios
        .get("/locations/" + this.services_form.location + "/services")
        .then(res => {
          this.services = res.data;
        })
        .catch(err => {
          console.log(err);
        });
    },

    updateService(service) {
      if (service.hasOwnProperty("id") && service.name.trim() !== "") {
        this.loading = true;
        this.axios
          .patch("/services/" + service.id, { name: service.name, base_price: service.base_price })
          .then(res => {})
          .catch()
          .then(() => {
            this.loading = false;
          });
      }
    },

    saveService() {
      this.$refs["services_form"].validate(valid => {
        if (valid) {
          this.loading = true;
          this.axios
            .post("/locations/" + this.services_form.location + "/services", {
              name: this.services_form.name,
              base_price: this.services_form.price,
              serviceCategoryId: this.activeCompany.serviceCategories[0].id,
              companyId: this.activeCompany.id
            })
            .then(res => {
              this.services.push(res.data);
              this.reloadServices();
              this.services_form = {
                name: "",
                location: this.activeCompany.locations[0].id,
                price: ""
              };
            })
            .catch(err => {
              this.$helpers.errorHandle(err, this)
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },

    deleteService(service) {
      this.loading = true;
      this.axios
        .delete("/services/" + service.id)
        .then(res => {
          this.reloadServices();
        })
        .catch(err => {})
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss"></style>
