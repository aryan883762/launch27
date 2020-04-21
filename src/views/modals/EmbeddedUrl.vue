<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal"
                   @close="settingsRedirect" custom-class="fullscreen-modal-display"
                   title="Embedded URL">

            <template>
                <el-tabs tab-position="left">
                    <el-tab-pane label="Overview">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Overview</h2>
                            </div>
                            <div>
                                <span class="embedded-text"><br/>
                                    You can pre-select the Service and Frequency on your booking form.
                                    This would be useful if you want to share a link for a specific service you offer. 
                                    Once the customer clicks that link, 
                                    they’ll be taken to your booking form with the service already selected for them.
                                </span>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="How it Works">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>How it Works</h2>
                            </div>
                            <div>
                                <span  class="embedded-text"><br/>
                                    By adding certain key-value pairs (called query string parameters) to the URL  of your Booking page, 
                                    you can tell the Launch27 booking form the date of the service as well as the Frequency to pre-select when the form loads.
                                    <br/><br/>

                                    Here are some query string parameters that you may use (more details further down):
                                    <br/><br/>

                                    date = the date of the service pre-selected on the date picker widget<br/>
                                    time = the time of the service pre-populated on the time widget<br/>
                                    frequency_id = ID of the frequency they want to preselect when form loads<br/><br/>

                                    An example of how a link would look with all of these parameters set is:<br/><br/>

                                    A normal booking page URL: <i class="embedded-link">http://www.yoursite.com</i><br/>
                                    URL with parameters: <i class="embedded-link">http://yoursite.com/?date=2020-02-28&time=16-00</i>
                                </span>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Single & Multiple Parameters">
                         <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Single & Multiple Parameters</h2>
                            </div>
                            <div>
                                <!-- Single -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Single Parameter
                                    </span>
                                    <span class="embedded-text"><br/>
                                        When you are adding a single parameter, you always add a ‘?’ before the name of the parameter.
                                        <br/><br/>

                                        <b>Zip Code</b><br/>
                                        This sets the zip code to be pre-filled on the form:<br/>
                                        <i class="embedded-link">http://yoursite.com/?zip=12345</i>
                                        <br/><br/>

                                        <b>Phone</b><br/>
                                        This would be used to pre-enter a phone number:<br/>
                                        <i class="embedded-link">http://yoursite.com/?phone=+123456789</i>
                                    </span>
                                </el-row>
                                
                                <!-- multiple -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Multiple Parameters
                                    </span>
                                    <span class="embedded-text"><br/>
                                        When you are adding multiple parameters, you always add a ‘?’ before the name of the FIRST parameter, then a ‘&’ before the name of each subsequent parameter
                                        <br/><br/>

                                        <b>Frequency Only</b><br/>
                                        This would be used if you want the frequency with the given ID to be pre-selected:<br/>
                                        <i class="embedded-link">http://www.yoursite.com/?frequency_id={{ frequencies[0]? frequencies[0].id : "5e3b4f1b7f50f2197213bc35" }}</i>
                                        <br/><br/>

                                        <b>Frequency and Zip Code</b><br/>
                                        This sets the frequency and zip code to be pre-filled on the form:<br/>
                                        <i class="embedded-link">http://yoursite.com/?frequency_id={{ frequencies[0]? frequencies[0].id : "5e3b4f1b7f50f2197213bc35" }}&zip=12345</i>
                                        <br/><br/>

                                        <b>All of them</b><br/>
                                        This pre-fills all three (Frequency id, zip code and phone number) fields on the form.<br/>
                                        <i class="embedded-link">http://yoursite.com/?frequency_id={{ frequencies[0]? frequencies[0].id : "5e3b4f1b7f50f2197213bc35" }}&zip=12345&phone=+123456789</i>
                                    </span>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Customer Info">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Customer Info</h2>
                            </div>
                            <div>
                                <!-- First Name -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        First Name:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the first name in the booking form is 'first_name'. 
                                        This key takes a name as its value. for example;<br/><br/>

                                        <i class="embedded-link">http://www.yoursite.com/?first_name=John</i>
                                    </span>
                                </el-row>

                                <!-- Last Name -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Last Name:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the last name in the booking form is 'last_name'.
                                        This key takes a name as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?last_name=Doe</i>
                                    </span>
                                </el-row>

                                <!-- Email -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Email:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the email in the booking form is 'email'. 
                                        This key takes an email as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?first_name=test@test.com</i>
                                    </span>
                                </el-row>

                                <!-- Zip -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Zip:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the address zip in the booking form is 'zip'. 
                                        This key takes a zip code as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?zip=1234</i>
                                    </span>
                                </el-row>

                                <!-- Phone -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Phone number:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the phone number in the booking form is 'phone'. 
                                        This key takes a phone number as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?phone=123456789</i>
                                    </span>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Service Date">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Service Date</h2>
                            </div>
                            <div>
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Service Date:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select the date of the service in the booking form is 'date'. 
                                        This key takes a specific date structure (YYYY-MM-DD) e.g.<br/><br/> 
                                        '2020-02-28' (representing February 28th 2020) as its value.
                                        for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?date=2019-11-17</i>
                                    </span>
                                </el-row>

                                <!-- Service Time -->
                                <el-row>
                                    <span class="embedded-header"><br/>
                                        Service Time:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select the time of the service in the booking form is 'time'. 
                                        This key takes a specific time structure (HH-MM) e.g.<br/><br/> 
                                        '16-00' (representing 4pm) as its value.
                                        for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?time=16-00</i>
                                    </span>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Frequency">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Frequency</h2>
                            </div>
                            <div>
                                <!-- Frequency ID -->
                                <el-row style="margin-top:50px;" v-if="frequencies.length>0">
                                    <span class="embedded-header"><br/>
                                        Frequency:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select a frequency in the booking form is 'frequency_id'.
                                        This key takes one of the frequency ids (unique to this company) as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?frequency_id={{ frequencies[0].id }}</i>
                                    </span>
                                    <el-table :data="frequencies">
                                        <el-table-column fixed="left" prop="name" label="Frequency"/>
                                        <el-table-column fixed="right" prop="id" width="200" label="ID"/>
                                    </el-table>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Additions">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Additions</h2>
                            </div>
                            <div>
                                <!-- Discount code -->
                                <el-row v-if="discountCodes.length>0">
                                    <span class="embedded-header"><br/>
                                        Discount Code:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the discount code field of the booking form is 'rcode'. 
                                        This key takes a discount code name as its value. for example;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?rcode={{ discountCodes[0].discount_code}}</i>
                                    </span>
                                    <el-table :data="discountCodes">
                                        <el-table-column fixed="left" prop="discount_code" label="Company Discount Codes"/>
                                        <el-table-column fixed="right" width="120" prop="discount_value" label="Amount">
                                            <template slot-scope="scope">
                                                {{ scope.row.discount_type === "percent" ? scope.row.discount_value+" %" : $currency+" "+scope.row.discount_value}}
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Service">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Service</h2>
                            </div>
                            <div>
                                <!-- Service Category -->
                                <el-row v-if="categories.length>0">
                                    <span class="embedded-header"><br/>
                                        Service Catergories:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select a category in the booking form is 'service_category'.
                                        This key takes one of the service category ids (unique to this company) as its value. e.g;<br/><br/>
                                        <i class="embedded-link">http://www.yoursite.com/?service_category={{ categories[0].id }}</i>
                                    </span>
                                    <el-table :data="categories">
                                        <el-table-column fixed="left" prop="name" label="Categories"/>
                                        <el-table-column fixed="right" width="200" prop="id" label="ID"/>
                                    </el-table>
                                </el-row>

                                <!-- Services -->
                                <el-row v-if="services.length>0">
                                    <span class="embedded-header"><br/>
                                        Services:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select a service in the booking form is 'service_ids'.
                                        Note that the key is in plural which means it can pre-select mutiple services at once.
                                        The key takes service ids (unique to this company) as its value. for example;<br/><br/>

                                        <i class="embedded-link">http://www.yoursite.com/?service_ids={{ services[0].id }}</i>
                                        <br/><br/>
                                        <template v-if="services.length>1">
                                            For pre-selecting multiple services, just add a double comma ',,' followed by the next service id. for example;<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_ids={{ services[0].id }},,{{ services[1].id}}</i>
                                        </template>
                                    </span>
                                </el-row>

                                <!-- Hourly Options -->
                                <el-row v-if="services.length>0">
                                    <span class="embedded-header"><br/>
                                        Service Options:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the service options in the booking form is 'service_options'.
                                        Also note, this is set up to handle all service options at once.
                                        This key has a specific value structure ('service id'-H'hours for service'T'Number of teams') for each service option. i.e.<br/>
                                        {{services[0].id}}-H3T2 (The '3' represents number of hours and the '2' is number of teams).
                                        for example;<br/><br/>

                                        <i class="embedded-link">http://www.yoursite.com/?service_options={{services[0].id}}-H3T2</i>
                                        <br/><br/>

                                        <template v-if="services.length>1">
                                            For mutiple service options append the next service option infront of a double comma ',,' for example;<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_options={{services[0].id}}-H3T2,,{{services[1].id}}-H2T1</i>
                                        </template>
                                    </span>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Pricings & Extras">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Pricings & Extras</h2>
                            </div>
                            <div>
                                <!-- Pricing variable -->
                                <el-row style="margin-top:50px;" v-if="extras.length>0 && services.length>1">
                                    <span class="embedded-header"><br/>
                                        Service Pricing Variables:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-populate the service pricing variables in the booking form is 'service_pricings'.
                                        This key has a specific value structure ('service id'-'pricing variable id':'quantity') for each service pricing variable. i.e.
                                        The 'service id' followed by a hyphen (-) then the 'pricing variable id' followed by a colon (:) then the 'quantity'.<br/>
                                        for example;<br/>

                                        <b>Single Service with Single Pricing Variable</b><br/><br/>

                                        <i class="embedded-link">http://www.yoursite.com/?service_pricings={{services[0].id}}-{{pricings[0].id}}:1</i><br/><br/>
                                        
                                        <template v-if="pricings.length>1">
                                            <b>Single Service with Multiple Pricing Variables</b><br/>
                                            Structure: ('service id 1'-'pricing variable id 1':'1','pricing variable id 2':'5')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{pricings[0].id}}:1,{{pricings[1].id}}:5</i><br/><br/>
                                        </template>

                                        <template v-if="services.length>1">
                                            <b>Multiple Services with Single Pricing Variable</b><br/>
                                            Structure: ('service id 1'-'pricing variable id 1':'1',,'service id 2'-'pricing variable id 1':'4')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{pricings[0].id}}:1,,{{services[1].id}}-{{pricings[0].id}}:4</i><br/><br/>
                                        </template>
                                        
                                        <template v-if="services.length>1 && pricings.length>1" >
                                            <b>Multiple Services with Multiple Pricing Variables</b><br/>
                                            Structure: ('service id 1'-'pricing variable id 1':'3','pricing variable id 2':'4',,'service id 2'-'pricing variable id 1':'1','pricing variable id 2':'5')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{pricings[0].id}}:3,{{pricings[1].id}}:4,,{{services[1].id}}-{{pricings[0].id}}:1,{{pricings[1].id}}:5</i>
                                        </template>
                                        
                                        <br/><br/>Note: If the quantity exceeds the maximum allowed quantity of the pricing variable, the maximum quantity would be used instead.<br/>
                                    </span>
                                </el-row>
                                
                                <!-- Service Extras -->
                                <el-row style="margin-top:50px;" v-if="extras.length>0 && services.length>1">
                                    <span class="embedded-header"><br/>
                                        Service Extras:
                                    </span>
                                    <span class="embedded-text"><br/>
                                        The assigned key to pre-select the service extras in the booking form is 'service_extras'.<br/>
                                        This key has a specific value structure ('service id'-'extra id 1': 'quantity') for each service extra. i.e.
                                        The 'service id' followed by a hyphen (-) then the 'extras ids' seperated by commas (,) each with a quantity after a colon (:) following the id<br/>
                                        for example;<br/>

                                        <b>Single Service with Single Extra</b><br/><br/>

                                        <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{extras[0].id}}:2</i><br/><br/>
                                        
                                        <template v-if="extras.length>1">
                                            <b>Single Service with Multiple Extras</b><br/>
                                            Structure: ('service id 1'-'extra id 1':'quantity','extra id 2':'quantity')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{extras[0].id}}:1,{{extras[1].id}}:5</i><br/><br/>
                                        </template>

                                        <template v-if="services.length>1">
                                            <b>Multiple Services with Single Extra</b><br/>
                                            Structure: ('service id 1'-'extra id 1':'quantity',,'service id 2'-'extra id 1':'quantity')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{extras[0].id}}:2,,{{services[1].id}}-{{extras[0].id}}:1</i><br/><br/>
                                        </template>
                                        
                                        <template v-if="services.length>1 && extras.length>1" >
                                            <b>Multiple Services with Multiple Extras</b><br/>
                                            Structure: ('service id 1'-'extra id 1':'quantity','extra id 2':'quantity','service id 2'-'extra id 1':'quantity','extra id 2':'quantity')<br/><br/>

                                            <i class="embedded-link">http://www.yoursite.com/?service_extras={{services[0].id}}-{{extras[0].id}}:1,{{extras[1].id}}:3,,{{services[1].id}}-{{extras[0].id}}:2,{{extras[1].id}}:1</i>
                                        </template>
                                    </span>
                                </el-row>
                            </div>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="Service List & Ids">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <h2>Service List & Ids</h2>
                            </div>
                            <div>
                                <el-table :data="services">
                                    <el-table-column fixed="left" type="expand">
                                        <template slot-scope="scope">
                                            <!-- extra table -->
                                            <el-table :data="scope.row.extras" v-if="scope.row.extras.length>0">
                                                <el-table-column fixed="left" prop="name" label="Extra"/>
                                                <el-table-column fixed="right" prop="minimum_quantity" label="Min Quantity"/>
                                                <el-table-column fixed="right" prop="maximum_quantity" label="Max Quantity"/>
                                                <el-table-column fixed="right" width="120" label="Price">
                                                    <template slot-scope="scope">
                                                        {{$currency}} {{ scope.row.price }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column fixed="right" width="200" prop="id" label="ID"/>
                                            </el-table>
                                            <!-- pricing variable table -->
                                            <el-table :data="scope.row.pricing_variables" v-if="scope.row.pricing_variables.length>0">
                                                <el-table-column fixed="left" prop="name" label="Pricing Variable"/>
                                                <el-table-column fixed="right" width="200" prop="id" label="ID"/>
                                            </el-table>
                                        </template>
                                    </el-table-column>
                                    <el-table-column fixed="left" prop="name" label="Service"/>
                                    <el-table-column fixed="left" label="Categories">
                                        <template slot-scope="scope">
                                            <span v-for="cat in scope.row.service_categories" :key="cat.id">
                                                {{cat.name}},
                                            </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column fixed="right" width="120" label="Base Price">
                                        <template slot-scope="scope">
                                            {{$currency}} {{ scope.row.base_price }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column fixed="right" label="Hourly">
                                        <template slot-scope="scope">
                                            {{scope.row.hourly ? "Yes": "No"}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column fixed="right" width="200" prop="id" label="ID"/>
                                </el-table>
                            </div>
                        </el-card>
                    </el-tab-pane>
                </el-tabs>
            </template>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: "SettingsService",
        data() {
            return {
                showModal: false,
                company: "",
                loading: false,
                frequencies: [],
                services:[],
                discountCodes: [],
                extras: [],
                categories: [],
                pricings: []
            };
        },
        mounted() {
            this.showModal = true;
        },
        created() {
            this.company = this.$auth.user().company
            this.fetchFrequencies();
            this.fetchServices();
            this.fetchDiscountCodes();
            this.fetchServiceExtras();
        },
        methods: {
            settingsRedirect() {
                this.$router.back()
            },
            fetchDiscountCodes() {
                this.axios({
                    url: '/companies/current/discount_codes',
                    method: 'GET',
                    params: {
                        filter: {
                            where: {
                                active: true
                            }
                        }
                    },
                })
                .then(response => {
                    if (response.data) {
                        this.discountCodes = response.data;
                    }
                })
                .catch(e => {
                })
            },
            fetchServiceExtras() {
                this.axios({
                    url: '/companies/current/extras',
                    method: 'GET',
                    params: {
                        filter: {
                            where: {
                                active: true
                            }
                        }
                    },
                })
                .then(response => {
                    if (response.data) {
                        this.extras = response.data;
                        this.extras.forEach(extra =>{
                            if(extra.oldVersionId){
                                extra.id = extra.oldVersionId;
                            }
                        });
                    }
                })
                .catch(e => {
                })
            },
            fetchServices() {
                var data = {
                    filter: {
                        include: [
                            {
                                relation: 'pricing_variables',
                                scope: {
                                    where: {active: true},
                                    include: 'prices'
                                }
                            },
                            'service_categories',
                            {
                                relation: 'extras',
                                scope: {
                                    where: {active: true}
                                }
                            }
                        ],
                        where: {active: true}
                    },
                };
                this.axios({
                    url: '/companies/current/services',
                    method: 'GET',
                    params: data,
                })
                .then(response => {
                    if (response.data) {
                        this.services = response.data;
                        this.categories = [];
                        this.pricings = [];

                        this.services.forEach(service=>{
                            if(service.oldVersionId){
                                service.id = service.oldVersionId;
                            }

                            service.extras.forEach(extra =>{
                                if(extra.oldVersionId){
                                    extra.id = extra.oldVersionId;
                                }
                            });

                            service.pricing_variables.forEach(pv =>{
                                if(pv.oldVersionId){
                                    pv.id = pv.oldVersionId;
                                }
                            });
                            service.service_categories.forEach(category=>{
                                if(category.oldVersionId){
                                    category.id = category.oldVersionId;
                                }
                                if(this.categories.filter(cat => cat.id.toString() === category.id.toString()).length === 0){
                                    this.categories.push(category);
                                }
                            })
                        })

                        this.services.forEach(service=>{
                            service.pricing_variables.forEach(pricing=>{
                                if(this.pricings.filter(pri => pri.id.toString() === pricing.id.toString()).length === 0){
                                    this.pricings.push(pricing);
                                }
                            })
                        })
                    }
                })
                .catch(e => {
                })
            },
            fetchFrequencies() {
                this.axios({
                    url: '/companies/current/frequencies',
                    method: 'GET',
                    params: {
                        filter: {
                            where: {
                                active: true
                            }
                        }
                    }
                })
                .then(response => {
                    if (response.data) {
                        this.frequencies = response.data;
                        this.frequencies.forEach(freq =>{
                            if(freq.oldVersionId){
                                freq.id = freq.oldVersionId;
                            }
                        });
                    }
                })
                .catch(e => {
                })
            }
        }
    };
</script>
<style lang="scss">
    .embedded-header{
        font-weight: 600;
        font-size: 1.3em;
    }
    .embedded-text{
        font-size: 0.9em;
    }
    .embedded-link{
        font-size: 1em;
        color: blue;
    }
    .policies-page {
        .el-card__header {
            background: #f3f3f3;
            height: 80px;

            div{
                font-weight: 500;
            }

            p {
                margin: 0px;
                font-size: 12px;
                line-height: 1.5;
                font-style: italic;
            }
        }

        .el-checkbox__input {
            vertical-align: top;
            margin-top: 5px;
        }

        .policies-card {
           // box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
            box-shadow : none;
            margin-bottom: 10px;
            height: 450px;
            max-height: 450px;

            .el-radio {
                display: block;
            }

        }
    }
</style>
