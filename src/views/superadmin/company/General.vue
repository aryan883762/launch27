<template>
  <el-card shadow="never" v-loading="loading" :body-style="{minHeight: '300px'}" 
           class="company-view-card-main">
    <el-row v-if="!company.id">
      <h3 class="text-center" v-if="!loading">Company not found</h3>
    </el-row>
    <el-row :gutter="20" v-else>
      <el-col :sm="24" :md="16" class="spaced-row">
        <el-row>
          <el-col>
            <el-card v-loading="company_loading" class="disabled-dark-text">
              <div slot="header" class="clearfix">
                <span>Company Details</span>
                <el-button class="card-btn" type="primary" round size="mini" v-if="company_disabled"
                           @click="company_disabled = false">Edit</el-button>
                <el-button class="card-btn" type="success" round size="mini" v-if="!company_disabled"
                           @click="saveCompany">Save</el-button>
                <el-button class="card-btn cancel-btn" type="danger" round size="mini" v-if="!company_disabled"
                           @click="company_disabled = true">Cancel</el-button>
                <el-button style="margin-right: 5px;" class="card-btn" type="primary" round size="mini" :disabled="exporting"
                           @click="exportV2Bookings">{{exporting ? "Exporting" : "Export V2 Booking"}}</el-button>
              </div>
              <el-row :gutter="20">
                <el-form :model="company" :rules="company_rules" 
                    class="bg-white padding-2x" label-position="top" ref="companyForm">
                  <el-row>
                    <el-col>
                      <el-upload :action="getFileUrl()" :before-upload="beforeUpload" 
                          :headers="getHeaders()" :on-error="uploadError" 
                          :on-success="uploadSuccess" :show-file-list="false" 
                          class="avatar-uploader" :disabled="company_disabled">
                        <el-avatar :size="178" :src="company.business_logo" fit="contain">
                          <i class="el-icon-plus avatar-uploader-icon" v-if="!company.business_logo"></i>
                        </el-avatar>
                        <small style="display: block;" v-if="!company_disabled">Click to change</small>
                      </el-upload>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :md="12" :sm="12" :xs="24">
                      <el-form-item label="Status" prop="status">
                        <el-select v-model="company.status" :disabled="company_disabled">
                          <el-option label="Active" value="active">Active</el-option>
                          <el-option label="Paused" value="paused">Paused</el-option>
                          <el-option label="Frozen" value="frozen">Frozen</el-option>
                          <el-option label="Canceled" value="canceled">Canceled</el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>

                    <el-col :md="12" :sm="12" :xs="24">
                      <el-form-item label="Subscription Discount">
                        <el-input v-model="company.discount_amount" :disabled="company_disabled">
                          <span slot="append">
                            <el-select v-model="company.discount_type" style="width:120px" :disabled="company_disabled">
                                <el-option value="amount" :label="'amount ('  + $currency + ')'"></el-option>
                                <el-option value="percent" label="percent (%)"></el-option>
                            </el-select>
                          </span>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-divider></el-divider>
                  <el-row :gutter="20">
                    <el-col :md="12" :sm="12" :xs="24">
                      <el-form-item label="Business Name" prop="business_name">
                        <el-input v-model="company.business_name" :disabled="company_disabled"/>
                      </el-form-item>
                      <el-form-item label="Phone" prop="phone">
                        <el-input type="tel" v-model="company.phone" :disabled="company_disabled">
                          <span slot="prepend" v-if="company.country_selected"> ({{ company.country_selected.emoji }} +{{ company.country_selected.phone }}) </span>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="Industry" prop="industry">
                        <el-select v-model="company.industry" :disabled="company_disabled">
                          <el-option :key="industry.industry_code" :label="industry.name" :value="industry.industry_code" v-for="industry in industries" />
                        </el-select>
                      </el-form-item>
                      <el-form-item prop="country">
                        <span slot="label">
                          Country -
                          <span class="currency" v-if="company.country">
                            Currency: <strong>{{ company.country.currency }} {{ company.country.emoji }} 
                            </strong></span>
                        </span>
                        <el-form-item prop="country">
                          <el-select autocomplete="nope" filterable placeholder="Country" 
                                     v-model="company.country" value-key="name"
                                     @change="countryChanged" :disabled="company_disabled">
                            <el-option-group :key="group.label" :label="group.label" v-for="group in [{ label: 'Popular', countries: [countries['AU'], countries['CA'], countries['NZ'], countries['ZA'], countries['US'], countries['GB']] }, { label: 'Countries', countries: countries }]">
                              <el-option :value="country" v-for="country in group.countries" :key="country.name" :label="country.name + '(+' + country.phone + ')'"> {{ country.emoji }} {{ country.name }} (+{{ country.phone }})</el-option>
                            </el-option-group>
                          </el-select>
                        </el-form-item>
                      </el-form-item>
                      <el-form-item label="Address" prop="business_address" 
                                    :class="{'el-input': company_disabled, 'is-disabled': company_disabled}">
                                    <vue-google-autocomplete autocomplete="false"
                                               ref="address"
                                               classname="el-input__inner" 
                                               id="company_address_auto" 
                                               v-on:placechanged="getAddressData" 
                                               :country="company.country.isoCode">                          
                        </vue-google-autocomplete>
                      </el-form-item>
                      <el-form-item label="Subdomain (.launch27.com)" prop="subdomain">
                        <el-input type="text" v-model="company.subdomain" :disabled="company_disabled" />
                      </el-form-item>
                      <el-row :gutter="20">
                        <el-col :md="12">
                          <el-form-item label="Main Site Color" prop="main_color">
                            <el-color-picker v-model="company.main_color" :disabled="company_disabled" />
                          </el-form-item>
                        </el-col>
                        <el-col :md="12">
                          <el-form-item label="Button Color" prop="button_color">
                            <el-color-picker v-model="company.button_color" :disabled="company_disabled" />
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-col>

                    <el-col :md="12" :sm="12" :xs="24">
                      <el-form-item label="Website" prop="business_url">
                        <el-input v-model="company.business_url" :disabled="company_disabled" />
                      </el-form-item>
                      <el-form-item label="Booking URL" prop="booking_url">
                        <el-input type="text" v-model="company.booking_url" :disabled="company_disabled" />
                      </el-form-item>
                      <el-form-item label="Support Email" prop="support_email">
                        <el-input type="email" v-model="company.support_email" :disabled="company_disabled" />
                      </el-form-item>
                      <el-form-item label="Time Zone" prop="timezone">
                        <el-select v-model="company.timezone" :disabled="company_disabled">
                          <el-option v-for="tz in time_zones" :value="tz.timezone" :key="tz.timezone" :label="tz.label"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="'Date (' + company.date_format + ')'" prop="date_format">
                          <el-select v-model="company.date_format" :disabled="company_disabled">
                          <el-option :label="$moment().format('DD-MM-YYYY')" value="DD-MM-YYYY"></el-option>
                          <el-option :label="$moment().format('MM-DD-YYYY')" value="MM-DD-YYYY"></el-option>
                          <el-option :label="$moment().format('YYYY-MM-DD')" value="YYYY-MM-DD"></el-option>
                          <el-option :label="$moment().format('DD.MM.YYYY')" value="DD.MM.YYYY"></el-option>
                          <el-option :label="$moment().format('MM.DD.YYYY')" value="MM.DD.YYYY"></el-option>
                          <el-option :label="$moment().format('MM/DD/YYYY')" value="MM/DD/YYYY"></el-option>
                          <el-option :label="$moment().format('DD/MM/YYYY')" value="MM/DD/YYYY"></el-option>
                          <el-option :label="$moment().format('Do/MM/YYYY')" value="Do/MM/YYYY"></el-option>
                          <el-option :label="$moment().format('MM/Do/YYYY')" value="MM/Do/YYYY"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="'Time Format ( 1:20 PM / 13:20 )'" prop="time_format">
                          <el-select v-model="company.time_format" :disabled="company_disabled">
                          <el-option :label="$moment().format('hh:mm a')" value="hh:mm a"></el-option>
                          <el-option :label="$moment().format('HH:mm')" value="HH:mm"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col class="text-center">
                      <el-button type="success" round v-if="!company_disabled" @click="saveCompany">Save</el-button>
                    </el-col>
                  </el-row>
                </el-form>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
      <el-col :sm="24" :md="8" class="spaced-row">
        <el-row>
          <el-col>
            <el-card>
              <div slot="header" class="clearfix">
                <span>Options</span>
              </div>
              <el-row v-if="company.account">
                <el-col>
                  <el-button type="success" round @click="impersonate(company.account.id)">
                    Impersonate Owner ({{ company.account.fullname }})
                  </el-button>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-button type="primary" round @click="card_show_modal = true">
                    Edit Card Processor
                  </el-button>
                </el-col>
              </el-row>
              <el-row >
                <el-col>
                  <el-button type="primary" round @click="trial_show_modal = true" v-if="company.subscription.plan_id === 'free'">
                    Change Trial End
                  </el-button>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <el-row v-if="company.payment_methods">
          <el-col>
            <el-card>
              <div slot="header" class="clearfix">
                <span>Billing Info</span>
              </div>
              <el-row>
                <el-col>
                  <div class="details-item">
                    <div class="details-item-title">Card Processor</div>
                    <div class="details-item-body">{{ company.payment_methods.card_processor }}</div>
                  </div>
                  <div class="details-item" v-if="(company.payment_methods.card_processor === 'fspay') && company.payment_methods.fspay_credentials">
                    <div class="details-item-title">FSPAY Merchant ID</div>
                    <div class="details-item-body">{{ company.payment_methods.fspay_credentials.merchantId }}</div>
                  </div>
                  <div class="details-item" v-else-if="company.payment_methods.stripe_connect">
                    <div class="details-item-title">Stripe Users ID</div>
                    <div class="details-item-body">{{ company.payment_methods.stripe_connect.stripe_user_id }}</div>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Payment Methods</div>
                    <div class="details-item-body">
                      <el-tag type="success" v-if="company.payment_methods.card">Card</el-tag>
                      <el-tag type="success" v-if="company.payment_methods.check">Check</el-tag>
                      <el-tag type="success" v-if="company.payment_methods.cash">Cash</el-tag>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <el-row v-if="company.subscription">
          <el-col>
            <el-card>
              <div slot="header" class="clearfix">
                <span>Subscription</span>
              </div>
              <el-row>
                <el-col>
                  <div class="details-item">
                    <div class="details-item-title">Plan</div>
                    <div class="details-item-body">{{ company.subscription.plan_name }} ({{ company.subscription.recurring }})</div>
                  </div>
                  <div class="details-item" v-if="company.subscription.plan_id !== 'free'">
                    <div class="details-item-title">Plan Amount</div>
                    <div class="details-item-body">{{ companyCurrency }}{{ company.subscription.plan_amount }}</div>
                  </div>
                  <div class="details-item" v-if="company.subscription.plan_id !== 'free'">
                    <div class="details-item-title">Active</div>
                    <el-tag :type="company.subscription.active ? 'success' : 'danger'">
                      {{ company.subscription.active ? 'Yes' : 'No' }}
                    </el-tag>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Created</div>
                    <div class="details-item-body">
                      {{$moment(company.subscription.created_at).format($date_format + ' ' + $time_format)}}
                    </div>
                  </div>
                  <div class="details-item" v-if="company.subscription.plan_id === 'free'">
                    <div class="details-item-title">Trial Days Left</div>
                    <div class="details-item-body">
                      {{ trial_days_left }} Days <span>({{ trial_days_expire }})</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-card>
              <div slot="header" class="clearfix">
                <span>Statistics</span>
              </div>
              <el-row>
                <el-col>
                  <div class="details-item">
                    <div class="details-item-title">Customers</div>
                    <div class="details-item-body">{{ company_stats.customers }}</div>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Services</div>
                    <div class="details-item-body">{{ company_stats.services }}</div>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Locations</div>
                    <div class="details-item-body">{{ company_stats.locations }}</div>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Bookings</div>
                    <div class="details-item-body">{{ company_stats.bookings }}</div>
                  </div>
                  <div class="details-item">
                    <div class="details-item-title">Sales</div>
                    <div class="details-item-body">
                      {{ companyCurrency }}{{ company_stats.salesValue }}
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row>
      <el-dialog title="Card Processor" :visible.sync="card_show_modal"  :fullscreen="false"
                 :close-on-press-escape="true" width="50%" append-to-body>
        <el-form :model="payment_method_data" v-loading="c_processor_loading">
          <el-form-item label="Card Processor" prop='c_processor'>
            <el-select v-model="payment_method_data.c_processor" placeholder="Select">
              <el-option label="Full Steam Pay" value="fspay">
                Full Steam Pay
              </el-option>
              <el-option label="Stripe" value="stripe">
                Stripe
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Stripe User ID" prop="stripe_user_id" v-if="payment_method_data.c_processor === 'stripe'">
            <el-input v-model="payment_method_data.stripe_user_id"/>
          </el-form-item>
          <el-form-item label="FSPay Merchant ID" prop="fspay_merchant_id" v-else>
            <el-input v-model="payment_method_data.fspay_merchant_id"/>
          </el-form-item>
          <el-form-item >
            <el-checkbox v-model="payment_method_data.card">Card</el-checkbox>
            <el-checkbox v-model="payment_method_data.check">Check</el-checkbox>
            <el-checkbox v-model="payment_method_data.cash">Cash</el-checkbox>
          </el-form-item>
          <el-form-item class="text-center">
            <el-button type="success" round @click="cardProcessorChanged">
              Save
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-row>
    <el-row>
      <el-dialog title="Trial End Edit" :visible.sync="trial_show_modal"  :fullscreen="false"
                 :close-on-press-escape="true" width="50%" append-to-body>
        <el-form label-position="top" :model="trial_end_form"  ref="trialEndForm"
          :rules="trial_date_rules" v-loading="trial_edit_loading">
          <el-form-item label="Trial Days Left">
            {{ trial_days_left }} Days <span>({{ trial_days_expire }})</span>
          </el-form-item>
          <el-form-item label="Custom Trial End" prop="custom_trial_end">
            <el-date-picker  
                :picker-options="pickerOptions"
                v-model="trial_end_form.custom_trial_end"
                type="date"
                placeholder="Pick a day"
              ></el-date-picker>
          </el-form-item>
          
          <el-form-item class="text-center">
            <el-button type="danger" round @click="trial_show_modal = false">
              Cancel
            </el-button>
            <el-button type="success" round @click="updateTrialEnd">
              Save
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-row>
  </el-card>
</template>

<script>
  import { countries } from "countries-list";
  import VueGoogleAutocomplete from "vue-google-autocomplete";
  import currencyData from 'currency-data';
  import ImpersonateMixin from '@/mixins/ImpersonateMixin';

  export default {

      components: {
          VueGoogleAutocomplete
      },
      mixins: [ImpersonateMixin],
      data: () => {
          return {
              loading: true,
              exporting: false,
              company_loading: false,
              company: {},
              countries: countries,
              time_zones: [],
              industries: [],
              company_disabled: true,
              card_show_modal: false,
              c_processor_loading: false,
              payment_method_data: {
                  c_processor: '',
                  stripe_user_id: '',
                  fspay_merchant_id: '',
                  card: false,
                  check: false,
                  cash: false
              },
              company_stats: {customers: 0, locations: 0, services: 0,
                  bookings: 0, salesValue: 0},
              company_rules: {
                  business_name: [{message: "Business name is required", required: true, trigger: "blur"}],
                  industry: [{message: "Select an industry", required: true, trigger: "blur"}],
                  status: [{message: "Select a status", required: true, trigger: "blur"}],
                  country: [{message: "Select a country", required: true, trigger: "blur"}],
                  business_address: [{message: "Please provide the business location", required: true, trigger: "blur"}],
                  business_url: [{message: "Provide a valid url", required: false, type: "url", trigger: "blur"}],
                  booking_url: [{message: "Provide a valid url", required: false, type: "url", trigger: "blur"}],
                  support_email: [{message: "Provide a valid url", required: false, type: "email", trigger: "blur"}],
                  timezone: [{message: "A timezone is required", required: true}],
                  subdomain: [
                      {type: "string", message: "Subdomain is required", required: true, trigger: "blur"},
                      {min: 3, message: "Subdomain length should be atleast 3", trigger: "blur"},
                      {type: "string", pattern: /(^[a-z0-9]+)([a-z0-9]+$)/, message: "Subdomain must be only lowercase letters without space", trigger: "blur"}
                  ]
              },
              trial_date_rules: {
                  custom_trial_end: [
                        {
                            validator: (rule, value, callback) => {
                                if (new Date(value).getTime() <= new Date().getTime() ) {
                                  return callback(new Error("Date must be valid and greater than today"));
                                } else {
                                  return callback();
                                }
                            },
                            trigger: "blur", required: true
                        }
                    ]
              },
              trial_days_left: 0,
              trial_days_expire: '',
              trial_show_modal: false,
              trial_end_form: {custom_trial_end: null},
              trial_edit_loading: false,
              pickerOptions: {
                disabledDate(date){
                  return date < new Date();
                }
              }
          };
      },
      computed: {
          companyCurrency() {
              if (this.company && this.company.currency) {
                  return this.company.currency.symbol
              } else if (this.company && this.company.country) {
                  let primaryCurrencyISOCode = this.company.country.currency.split(',')[0];
                  return currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
              } else {
                  return '';
              }
          }
      },
      mounted() {
          this.addKeyToCountries();
          this.loadCompany();
          this.loadCompanyGeneralStats();
          this.getIndustries();
          this.getTrialDaysLeft();
      },
      methods: {
          loadCompany() {
              this.axios.get('/companies/' + this.$route.params.id,
                      {
                          params: {
                              filter: {
                                  include: ['account']
                              }
                          }
                      })
                      .then(res => {
                          if (res.data) {
                              this.company = res.data;
                              if (!this.company.business_address) {
                                this.$set(this.company, 'business_address', "");
                              }
                              if (this.company.payment_methods) {
                                  this.payment_method_data.card = this.company.payment_methods.card;
                                  this.payment_method_data.check = this.company.payment_methods.check;
                                  this.payment_method_data.cash = this.company.payment_methods.cash;
                                  this.payment_method_data.stripe_user_id = this.company.payment_methods.stripe_user_id;
                                  if (this.company.payment_methods.fspay_credentials) {
                                      this.payment_method_data.fspay_merchant_id = this.company.payment_methods.fspay_credentials.merchantId;
                                  }
                                  if (this.company.payment_methods.card_processor) {
                                      this.payment_method_data.c_processor = this.company.payment_methods.card_processor;
                                  }
                              }
                          }
                      })
                      .finally(() => {
                          this.loading = false;
                          if (this.company.business_address) {
                              this.$refs.address.update(this.company.business_address);
                          }
                          this.loadTimeZones();
                      });
          },

          loadCompanyGeneralStats() {
              this.axios.get('/companies/general-stats/' + this.$route.params.id)
                      .then(res => {
                          if (res.data) {
                              this.company_stats = res.data;
                          }
                      });
          },

          getIndustries() {
              this.axios.get("/services/industries")
                      .then(res => {
                          this.industries = res.data;
                      });
          },

          addKeyToCountries() {
              for (let key in this.countries) {
                  this.countries[key].isoCode = key;
              }
          },

          getAddressData(addressData, placeResultData, id) {
              this.company.business_address = placeResultData.formatted_address;
              this.company.coordinates = {lat: placeResultData.geometry.location.lat(), lng: placeResultData.geometry.location.lng()};
          },

          getHeaders() {
              return {Authorization: this.$auth.token()};
          },

          getFileUrl() {
              return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
          },

          uploadSuccess(res, file) {
              this.company.business_logo = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
              this.company_loading = false;
          },

          uploadError() {
              this.company_loading = false;
          },

          beforeUpload() {
              this.company_loading = true;
              return true;
          },

          loadTimeZones() {
              this.axios.get("/companies/timezones",
                      {params: {country_code: this.company.country.isoCode}})
                      .then(res => {
                          this.time_zones = res.data;
                      });
          },

          saveCompany() {
              this.$refs["companyForm"].validate(valid => {
                  if (valid) {
                      this.company_loading = true;
                      this.axios.put("/companies", this.company)
                              .then(res => {
                                  this.$message.success("Company saved");
                                  this.company_disabled = true;
                              })
                              .catch(err => {
                                  this.$helpers.errorHandle("Company not saved");
                              })
                              .finally(() => {
                                  this.company_loading = false;
                              });
                  } else {
                      return false;
                  }
              });
          },

          countryChanged() {
              this.company.timezone = '';
              this.loadTimeZones();
          },

          cardProcessorChanged() {
              this.c_processor_loading = true;
              this.payment_method_data.companyId = this.company.id;
              this.axios.post("/payment_gateways/change-card-processor",
                      this.payment_method_data)
                      .then(res => {
                          this.$message.success("Card processor saved");
                          this.loadCompany();
                      })
                      .catch(err => {
                          this.$helpers.errorHandle(err, this)
                      })
                      .finally(() => {
                          this.c_processor_loading = false;
                      });
          },

          exportV2Bookings() {
            this.exporting = true;
            this.axios.post('company_reports/exportv2',{companyId: this.company.id,accountId: this.$auth.user().id}).then(result=>{
              this.$helpers.successHandle("Report sent to email",this);
              this.exporting = false;
            }).catch(err=>{
              this.$helpers.errorHandle(err,this);
              this.exporting = false;
            })
          },

          getTrialDaysLeft(){
              this.axios.get('/subscriptions/superadmin_days_left',
                      {
                          params: {
                              companyId: this.$route.params.id,
                              negative: true
                          }
                      })
                  .then(res => {
                      if (res.data > 0){
                        this.trial_days_left = res.data
                      } else {
                        this.trial_days_left = 0  
                      }
                      this.trial_days_expire = this.$moment().add(res.data, 'days')
                        .startOf('day').format(this.$date_format)
                      this.trial_end_form.custom_trial_end = this.$moment().add(res.data, 'days').utc().startOf("day")
                  })
                  .catch((err) => {
                  })
          },

          updateTrialEnd() {

              this.$refs["trialEndForm"].validate(valid => {
                  if (valid) {
                    this.trial_edit_loading = true;
                    this.axios.patch("/subscriptions/" + this.company.subscription.id, this.trial_end_form)
                        .then(res => {
                            this.$message.success("Trial end date updated");
                            this.getTrialDaysLeft();
                            this.trial_show_modal = false;
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.trial_edit_loading = false;
                        });
                  } else {
                      return false;
                  }
              });
          }
      }
  };
</script>

<style lang="scss">
  .el-card .cancel-btn {
      margin-right: 5px;
  }

  .details-item-body .el-tag {
      margin-right: 10px;
  }
</style>
