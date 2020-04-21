<template>
<!--
  <el-dialog :close-on-press-escape="true" :fullscreen="true" append-to-body :modal="false" :visible.sync="showModal" @close="goBack" custom-class="fullscreen-modal-display" title="Create Booking">
-->
    <!--Choose who booking is for-->

    <div class="modal-body create-booking">
      <el-row :gutter="20">
        <el-col :sm="16" class="">
          <el-card :body-style="{ padding: '0px;' }" class=" create-booking-card" shadow="never">
            <div class="flex-row-reverse">
              <el-button @click="resetForm" plain round size="mini" type="danger"> Reset Form</el-button>
            </div>

            <customer-step @content-updated="onStepValidate" :booking.sync="booking" @on-validate="onStepValidate" ref="customerStep"></customer-step>

            <transition mode="in-out" name="fade">
              <div v-show="current_step > 0">
                <el-divider>Address</el-divider>
                <location-step :account-id.sync="bookingModel.account_id" :booking.sync="booking" @on-validate="onStepValidate" ref="locationRef"></location-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 1">
                <el-divider>Services</el-divider>
                <service-step @content-updated="onStepValidate" @on-validate="onStepValidate" ref="serviceRef"></service-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 2">
                <el-divider>Date</el-divider>
                <date-step :booking.sync="booking" :new-booking.sync="bookingModel" :coordinates.sync="bookingModel.address.coordinates" @content-updated="onStepValidate" @on-validate="onStepValidate" ref="dateRef"></date-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 3">
                <el-divider>Frequency</el-divider>
                <frequency-step :selectedServices.sync="bookingModel.services" @content-updated="onStepValidate" @on-validate="onStepValidate" ref="frequencyRef"></frequency-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 4">
                <extras-step :selectedServices.sync="fullSelectedServices" @content-updated="onStepValidate" @on-validate="onStepValidate" ref="extraRef"></extras-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 5">
                <el-divider>Additions</el-divider>
                <additional-step :duration.sync="finalBookingModel.estimated_duration" @content-updated="onStepValidate" @on-validate="onStepValidate" ref="additionRef"></additional-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 6">
                <el-divider>Payment Options</el-divider>
                <payment-step :root-model.sync="bookingModel" @content-updated="onStepValidate" @on-validate="onStepValidate" ref="paymentRef"></payment-step>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="current_step > 7">
                <el-divider>Custom Fields</el-divider>
                <custom-fields @on-validate="onStepValidate" ref="customFieldRef"></custom-fields>
              </div>
            </transition>

            <el-divider></el-divider>

            <el-button @click="proceed" class="block-center" round style="width: 200px;" type="primary"> {{ current_step < 8 ? "Next" : "Complete Booking" }}</el-button>

            <label id="scroll_bottom" style="padding-top: 100px;display:block;"></label>
          </el-card>
        </el-col>

        <el-col :sm="8">
          <el-card>
            <div slot="header">
              Booking Summary
            </div>
            <el-row class="bg-white summary-row">
              <el-col :sm="24" v-if="bookingModel.address">
                <i class="el-icon-location-information"></i>
                <p>{{ bookingModel.address.full_address }}</p>
              </el-col>

              <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                <i class="el-icon-shopping-bag-1"></i>
                <div class="services-rows">
                  <span v-for="service in bookingModel.services">
                    <label>{{ getServiceName(service) }}</label>
                    <div v-html="getServiceOptions(service)"></div>
                  </span>
                </div>
              </el-col>

              <el-col :sm="24" v-if="bookingModel.service_date">
                <i class="el-icon-alarm-clock"></i>
                <p style="line-height: 2.5">{{ $moment(bookingModel.service_date).format("hh:mm a, Do-MM-YYYY") }}</p>
              </el-col>

              <el-col :sm="24" v-if="bookingModel.frequency">
                <i class="el-icon-s-shop"></i>
                <p style="line-height: 2.5">{{ bookingModel.frequency.name }}</p>
              </el-col>

              <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                <i class="el-icon-receiving"></i>
                <div class="services-rows">
                  <span v-for="service in bookingModel.services">
                    <label>{{ getServiceName(service) }}</label>
                    <small v-for="extra in bookingModel.extras" v-if="extra.service_id === service"> {{ extra.quantity }}x {{ extra.name }} </small>
                  </span>
                </div>
              </el-col>
            </el-row>
          </el-card>
          <el-card class="total-card" style="margin-top: 5px;">
            <div slot="header">
              Total
            </div>
            <div class="text item">
              Services
              <i>{{ $currency }}{{ summary.services || 0 }}</i>
            </div>
            <div class="text item">
              Extras
              <i>{{ $currency }}{{ summary.extras || 0 }}</i>
            </div>
            <div class="text item">
              Discount
              <i>({{ $currency }}{{ summary.discount || 0 }})</i>
            </div>
            <div class="text item">
              Subtotal
              <i>{{ $currency }}{{ summary.subtotal || 0 }}</i>
            </div>
            <div class="text item">
              Taxes
              <i>{{ $currency }}{{ summary.taxes_total || 0 }}</i>
            </div>

            <div class="text item" style="border-top: 1px solid #f3f3f3">
              TOTAL
              <i>{{ $currency }}{{ summary.total ? summary.total.toFixed(2) : 0 }}</i>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
<!--
  </el-dialog>
-->
</template>

<script>
import CustomerStep from "./booking_form/Customer.vue";
import LocationStep from "./booking_form/Location.vue";
import ServiceStep from "./booking_form/Services.vue";
import DateStep from "./booking_form/Date.vue";
import AdditionalStep from "./booking_form/Additions.vue";
import FrequencyStep from "./booking_form/Frequency.vue";
import ExtrasStep from "./booking_form/Extras.vue";
import PaymentStep from "./booking_form/Payment.vue";
import CustomFields from "./booking_form/CustomFields.vue";

import helper from "./booking_form/helper";

import { handleCardSetup } from "vue-stripe-elements-plus";

export default {
  components: {
    CustomerStep,
    LocationStep,
    ServiceStep,
    DateStep,
    FrequencyStep,
    AdditionalStep,
    ExtrasStep,
    PaymentStep,
    CustomFields
  },
  data: () => {
    return {
      activeTabIndex: 0,
      bookingModel: {},
      booking: false,
      showModal: false,
      total_price: 0,
      current_step: 0,
      stepRefs: ["customerStep", "locationRef", "serviceRef", "dateRef", "frequencyRef", "extraRef", "additionRef", "paymentRef", "customFieldRef"],
      customerValid: false,
      locationValid: false,
      dateValid: false,
      frequencyValid: false,
      company_services: [],
      summary: {},
      back: true
    };
  },

  computed: {
    finalBookingModel() {
      if (this.bookingModel && this.company_services.length > 0) {
        let results = helper.prepareBookingData(this.bookingModel, this.company_services);
        return results;
      }

      return {};
    },

    fullSelectedServices() {
      let data = [];
      if (this.bookingModel && this.bookingModel.services && this.company_services.length > 0) {
        this.bookingModel.services.forEach(srv_id => {
          if (this.company_services.length > 0) {
            let service = this.company_services.find(service => {
              return service.id === srv_id;
            });
            if (service) data.push(service);
          }
        });
      }

      return data;
    }
  },

  created() {
    this.$events.addListener("booking:data:services", this.updateServices);
    this.$events.addListener("booking:update:totals", this.updateModel);
  },

  beforeDestroy() {
    this.$events.removeListener("booking:data:services", this.updateServices);
    this.$events.removeListener("final:model:update", this.updateModel);
  },

  mounted() {
    this.showModal = true;

    //load the booking;
    if (this.$route.params && this.$route.params.id) {
      this.axios
        .get("/companies/current/bookings/" + this.$route.params.id)
        .then(res => {
          this.booking = res.data;
          this.current_step = 1;
        })
        .catch()
        .then();
    }
  },

  methods: {
    goBack() {
      if(this.back){
        this.$router.back();
      } else {
        // taking the user to the correct dashoard
        this.$router.replace({name: 'landing_page'});
      }
    },

    validate(ref) {
      return this.$refs[ref].validate();
    },

    updateModel() {
      //update an arbitrary property to force a reactive update
      this.bookingModel.timestamp = Math.random();
      let rand = this.finalBookingModel;
    },

    proceed() {
      if (this.current_step === 8) {
        //at this point confirm  & pay
        if (this.bookingModel.payment_type === "card") {
          this.setupCard(payment_method_id => {
            if (payment_method_id) {
              this.bookingModel.stripe_payment_method_id = payment_method_id;
              this.submitBooking();
            }
          });
        } else {
          this.submitBooking();
        }

        return;
      }

      this.validate(this.stepRefs[this.current_step]).then(valid => {
        if (valid) {
          this.current_step += 1;

          setTimeout(() => {
            document.getElementById("scroll_bottom").scrollIntoView({ block: "end", behavior: "smooth" });
          }, 1000);
        }
      });
    },

    submitBooking() {
      //Payment Method ID can be used to create the stripe customer
      //submitt data to server to create the booking now
      this.loading = true;
      this.axios
        .post("/companies/current/bookings", this.finalBookingModel)
        .then(res => {
          this.$message.success("Booking successfully placed");
          this.$router.push({ name: "dashboard_calendar_spots" });
        })
        .catch()
        .finally(_ => {
          this.loading = false;
        });
    },

    updateCustomer(customer) {
      this.bookingModel.customer = customer;
    },

    updateServices(services) {
      this.company_services = services;
    },

    updateDate(date) {
      this.bookingModel.service_date = date;
    },

    getServiceName(srv) {
      let service = this.company_services.find(service => {
        return srv === service.id;
      });

      if (service) return service.name;
    },

    getServiceOptions(service) {
      let full_service = this.company_services.find(srv => {
        return service === srv.id;
      });

      if (!full_service) return;

      if (this.bookingModel.service_options[service]) {
        if (this.bookingModel.service_options[service].hourly) {
          return "<small>" + this.bookingModel.service_options[service].hourly.teams + " teams for " + this.bookingModel.service_options[service].hourly.hours + " hrs" + "</small>";
        }

        let content = "";

        if (this.bookingModel.service_options[service].pricing_variables) {
          for (var x in this.bookingModel.service_options[service].pricing_variables) {
            let selected_pv = this.bookingModel.service_options[service].pricing_variables[x];

            if (selected_pv.not_ranged) {
              let full_pv = full_service.pricing_variables.find(pv => {
                return pv.id == x;
              });

              content += "<small>" + selected_pv.not_ranged + "x " + full_pv.name + "</small>";
            }

            if (selected_pv.ranged) {
              content += "<small>" + selected_pv.ranged.label || "Range (" + selected_pv.ranged.min_qty + " - " + selected_pv.ranged.max_qty + ")" + "</small>";
            }
          }
        }

        return content;
      }
    },

    getServiceExtras(service) {
      if (this.bookingModel.extras && this.bookingModel.extras.length > 0)
        this.bookingModel.extras.forEach(extra => {
          //let full_extra = this.service_extras
        });
      return "";
    },

    onStepValidate(validated, model) {
      if (validated) {
        this.bookingModel = { ...this.bookingModel, ...model };
        if (this.bookingModel.services && this.bookingModel.services.length > 0) this.getEstimatedPrice();
      }
    },

    getEstimatedPrice() {
      this.axios
        .post("/bookings/estimate_price", this.finalBookingModel)
        .then(res => {
          this.summary = res.data;
        })
        .catch()
        .finally(_ => {});
    },

    setupCard(callback) {
      this.axios
        .post("/payment_gateways/setup_intent", {})
        .then(res => {
          handleCardSetup(res.data.client_secret, {
            payment_method_data: {
              billing_details: {
                name: this.bookingModel.first_name + " " + this.bookingModel.last_name
              }
            }
          }).then(response => {
            if (response.setupIntent.status === "succeeded") {
              callback(response.setupIntent.payment_method);
            } else {
              callback(false);
            }
          });
        })
        .catch(err => {
          callback(false);
        })
        .finally(_ => {});
    },

    resetForm() {
      this.bookingModel = {};
      this.current_step = 0;
      this.$events.emitEvent("booking:form:reset");
    }
  },

  beforeRouteEnter(to, from, next) {
    // finding out if it was the first url to handle back
    next(vm => {
      vm.back = !(from.fullPath === '/' && from.matched.length == 0 && from.name == null)
    })
  }
};
</script>

<style lang="scss">
.modal-body {


  &.create-booking {
    padding: 10px;

    .el-divider {
      margin: 44px 0px;
    }

    .summary-row {
      .el-col {
        margin-bottom: 10px;

        i {
          font-size: 36px;
          float: left;
          margin-right: 10px;
        }

        p {
          display: inline-block;
          width: calc(100% - 100px);
          padding: 0;
          margin: 0;
          line-height: 1.3;
          color: black;
        }

        .services-rows {
          display: inline-block;
          width: calc(100% - 60px);

          span {
            display: block;

            small {
              display: block;
              margin-left: 10px;
            }
          }
        }
      }
    }

    .total-card {
      .text.item {
        position: relative;
        font-size: 15px;

        i {
          font-size: 15px;
          font-style: normal;
          position: absolute;
          right: 10px;
          font-weight: bold;
        }
      }
    }

    .create-booking-card.el-card__body {
      padding: 0px;
    }
  }
}
</style>
