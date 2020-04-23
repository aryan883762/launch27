<template>
    <div class="app-section charges" shadow="never">
        <el-card style="margin-bottom : 0px;">
            <el-row :gutter="0" class="stats-row">
                <div class="first">
                    <span class="stats-number _first">{{ total_records }}</span>
                    <label>Total Bookings</label>
                </div>
                <el-divider direction="vertical"/>
                <div class="second">
                    <span class="stats-number _second">{{$currency}} {{ charges_stats.totalHold }}</span>
                    <label>Total On Hold</label>
                </div>
                <el-divider direction="vertical"/>

                <div class="third">
                    <span class="stats-number _third">{{$currency}}  {{ Number(charges_stats.totalFailed).toFixed(2) }}</span>
                    <label>Total Pending</label>
                </div>
                <el-divider direction="vertical"/>

                <div class="fourth">
                    <span class="stats-number _fourth"> {{$currency}}  {{ charges_stats.totalCash }}</span>
                    <label>Total Cash</label>
                </div>
                <el-divider direction="vertical"/>

                <div class="fourth">
                    <span class="stats-number _fourth"> {{$currency}}  {{ charges_stats.totalCharged }}</span>
                    <label>Total Charged</label>
                </div>
                <el-divider direction="vertical"/>

                <div class="fourth">
                    <span class="stats-number _fourth"> {{$currency}}  {{ charges_stats.totalRevenue }}</span>
                    <label>Total Revenue</label>
                </div>
            </el-row>
        </el-card>

        <el-card style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-date-picker
                                :format="dt_format"
                                end-placeholder="End date"
                                range-separator="to"
                                unlink-panels="false"
                                size="small" start-placeholder="Start date" type="daterange" v-model="range"
                        />
                    </div>

                    <div class="pull-right main-filters">

                        <!--
                            <el-dropdown :disabled="checkedCharges.length === 0" @command="actionCommand" size="mini" style="margin-right: 10px;" type="primary">
                                <el-button size="mini" type="primary">
                                    Bulk Update<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="hold">Put on Hold</el-dropdown-item>
                                    <el-dropdown-item command="charge">Charge Cards / Mark as Paid</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        -->

                        <el-select class="filter small" style="margin-right: 10px;" multiple collapse-tags v-model="filter_payment_type" @change="loadCharges(1)">
                            <el-option label="Card" value="card"></el-option>
                            <el-option label="Cash" value="cash"></el-option>
                            <el-option label="Check/Cheque" value="check"></el-option>
                        </el-select>

                        <company-locations @change="loadCharges(1)" additional-class="pull-right" :multiple="true" :return-object="false" v-model="filter_location"></company-locations>

                        <el-select @change="loadCharges()" class="small filter"
                                   style="margin-right: 5px;" v-model="bookings_filter">
                            <el-option label="Active Bookings" value="active"></el-option>
                            <el-option label="Recurring Bookings" value="recurring"></el-option>
                            <el-option label="Completed Bookings" value="completed"></el-option>
                            <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                        </el-select>

                        <el-select class="filter small" placeholder="On hold,paid" @change="loadCharges()" multiple collapse-tags v-model="filter_payment_status">
                            <el-option label="On Hold" value="hold"></el-option>
                            <el-option label="Paid" value="paid"></el-option>
                            <el-option label="Unpaid" value="unpaid"></el-option>
                            <el-option label="Refunded" value="refunded"></el-option>
                        </el-select>

                        <team-select v-model="filter_team" :multiple="true" style="margin-right:10px;" additional-class="filter small" v-if="$can('manage', 'role_admin') || $can('manage', 'role_team')"
                                     :collapse-tags="true" @change="loadCharges" :show-add-teams="false"></team-select>

                    </div>
                </el-col>
            </el-row>

        </el-card>


        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 310) + 'px', height: (windowHeight - 310) + 'px', overflow: 'hidden'}">

            <el-card shadow="never" class="no-border" style="border:none;" v-loading="loading">
                <div style="margin-bottom: 15px;" v-if="bookings.length > 0">
                    <el-checkbox :indeterminate="isIndeterminate" @change="handleCheckAllChange" v-if="bookings && bookings.length > 0" v-model="checkAll">Select all</el-checkbox>
                    <el-button v-if="checkedCharges.length > 0" @click="actionCommand('hold')" size="mini" style="margin-left: 10px;" type="danger">
                        Put Charges on Hold
                    </el-button>

                    <el-button v-if="checkedCharges.length > 0" @click="actionCommand('charge')" size="mini" style="margin-left: 10px;" type="warning">
                        Charge Cards
                    </el-button>

                </div>
                <el-checkbox-group @change="handleCheckedChargesChange" v-model="checkedCharges">
                    <el-timeline>
                        <el-timeline-item :class="{forecasted: booking.forecasted}" :key="index" :timestamp="$moment(booking.service_date).format($date_format + ' ' + $time_format)" :hide-timestamp="true" placement="bottom" v-for="(booking, index) in bookings" v-if="booking.charge">
                            <div class="charge-headline" v-if="!booking.forecasted && booking.charge">


                                <el-tag type="success" effect="dark" class="paid" v-if="((booking.charge && booking.charge.outstanding == 0) || booking.charge.paid) && !booking.onhold_payment">Paid</el-tag>
                                <el-tag type="info" effect="dark" class="unpaid" v-if="!booking.charge.paid && !booking.onhold_payment && (booking.charge && booking.charge.outstanding > 0)">Unpaid</el-tag>
                                <el-tag type="danger" effect="dark" class="onhold" v-if="booking.payment_type == 'card' && booking.onhold_payment">On Hold</el-tag>
                                <el-divider class="divider-mini" direction="vertical"/>

                                <el-popover
                                        placement="top-start"
                                        ref="popover1"
                                        title="Billing note"
                                        trigger="click"
                                        width="300">
                                    <div>
                                        <blockquote>
                                            <p>{{booking.charge.billing_note}}</p>
                                        </blockquote>
                                        <i style="display:block; font-size:11px;" v-if="booking.charge.billing_note_author">{{booking.charge.billing_note_author.fullname}}</i>
                                        <el-link @click="addBillingNote(booking.charge)" size="mini" type="danger">Edit</el-link>

                                    </div>
                                    <el-button size="mini" slot="reference" type="text" v-if="booking.charge.billing_note">
                                        View Billing Note
                                    </el-button>
                                </el-popover>


                                <el-button @click="addBillingNote(booking.charge)" size="mini" type="text" v-if="!booking.charge.billing_note">
                                    Add Billing Note
                                </el-button>
                                <el-divider class="divider-mini" direction="vertical"/>
                                <el-button @click="addManualPayment(booking, 'list')" size="mini" type="text">
                                    View Payments
                                </el-button>
                                <el-divider class="divider-mini" direction="vertical"/>
                                <el-image :src="(booking.payment_type === 'card')?require(`@/assets/svgs/pay.svg`):require(`@/assets/svgs/money.svg`)" class="header-icon" fit="fit"></el-image>
                                <el-button class="header-icon-text" size="mini" type="text">
                                   {{(booking.payment_type === 'card')?'Card':'Cash'}}
                                </el-button>
                                <el-divider class="divider-mini" direction="vertical" v-if="booking.forecasted"/>
                                <i class="forecasted" v-if="booking.forecasted">Forecasted recurring - {{ booking.frequency.name }}</i>
                               <div class="header-booking-charge">
                                     <label>Total Amount:</label>
                                        <small><strong class="booking-total-amount">{{ $currency }}{{ booking.charge.total_after_tax }}</strong></small>
                                     <label>Total Paid:</label>
                                        <small><strong> {{ $currency }}{{ booking.charge.total_payments }}</strong></small>
                               </div>
                            </div>
                            <div class="charge-headline" v-if="booking.forecasted">
                                <i class="forecasted" v-if="booking.forecasted">Forecasted recurring - {{ booking.frequency.name }}</i>
                            </div>
                            <el-card :body-style="{padding: '15px'}" :class="{forecasted: booking.forecasted}" class="charge-card" shadow="hover" style="width:calc(100%); display:inline-block;" v-if="booking.charge">
                                <div class="flex-row">
                                    <div>
                                        <el-checkbox :key="booking.charge.id">
                                            <!-- <router-link  style="font-weight:bold;color:#ff8602;text-decoration:underline;" :to="{  name: 'dashboard_booking_view', params: {id: booking.id, service_date: booking.service_date} }"> {{$moment(booking.service_date).format($date_format + ' ' + $time_format)}}</router-link> -->
                                        </el-checkbox>
                                        <div class="name-address">
                                        <span class="p-name">{{ booking.account.first_name }} {{ booking.account.last_name }}</span>
                                        <span class="p-address">{{ booking.address.street }} {{ booking.address.city }} {{ booking.address.state }} {{ booking.address.zip }}</span>
                                        </div>
                                        
                                        <!-- <el-rate allow-half disabled style="margin-left: 25px;" v-if="booking.rating" v-model="booking.rating.rating"/>
                                        <el-rate disabled style="margin-left: 25px;" v-else></el-rate> -->
                                        <div class="time-and-services">
                                         <div>
                                            <div class="time-frequency">
                                                <small><strong>{{$moment(booking.service_date).format($time_format)}}</strong></small>
                                                <small>{{$moment(booking.service_date).format('MMMM DD')}}</small>
                                                <small>{{(booking.frequency)?booking.frequency.rule_id:''}}</small>
                                            </div>
                                                <div class="b-services">
                                                    <div v-if="booking.service_details && booking.service_details.length > 0">
                                                        <div class="services-rows">
                                                            <span v-for="service in booking.service_details">
                                                                <div v-html="getServiceOptions(booking, service)"></div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div v-if="booking.services && booking.services.length > 0">
                                                        <div class="services-rows">
                                                            <span v-for="service in booking.services">
                                                            <small v-for="extra in service.extras" v-if="extra.service_id === service.id"> {{ extra.quantity }} {{ extra.name }} </small>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div v-if="!booking.team_assignments || booking.team_assignments.length == 0">
                                            <small>No Team Assigned</small>
                                            <el-button @click="assignTeam(booking)" size="mini" type="text">
                                                Assign a team
                                            </el-button>
                                        </div>
                                        <div v-if="booking.team_assignments && booking.team_assignments.length > 0">
                                            <account-avatar :account="booking.team_assignments[0].team" body-class="pull-left"></account-avatar>
                                            <el-popover
                                                    placement="left"
                                                    trigger="hover"
                                                    width="200">
                                                <div class="team-popover-content">
                                                    <div style="margin-bottom: 10px;" v-for="assignment in booking.team_assignments">
                                                        <account-avatar :account="assignment.team" body-class="pull-left"></account-avatar>
                                                        <div style="display:inline-block; width:calc(100% - 45px); margin-left: 10px;    min-width: 120px;">
                                                            <small>{{ assignment.team.name }} </small>
                                                            <small style="display:block;"><strong> ({{assignment.pay_rate_type == 'percent' ? assignment.pay_rate + '%' : $currency + assignment.pay_rate}}) {{ getEarned(booking) }}</strong></small>
                                                            <el-rate disabled v-model="assignment.team.rating"></el-rate>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div slot="reference" style="display:inline-block; width:calc(100% - 45px); margin-left: 10px;    min-width: 120px;">
                                                    <div v-if="booking.team_assignments[0].team_model === 'team'">
                                                        <small>{{ booking.team_assignments[0].team.name }} <strong v-if="booking.team_assignments.length > 1"> (+{{booking.team_assignments.length - 1}}) </strong></small>
                                                        <el-rate disabled v-model="booking.team_assignments[0].team.rating"></el-rate>
                                                        <small><strong> ({{booking.team_assignments[0].pay_rate_type == 'percent' ? booking.team_assignments[0].pay_rate + '%' : $currency + booking.team_assignments[0].pay_rate}}) {{ getEarned(booking) }}</strong></small>
                                                    </div>
                                                    <div v-if="booking.team_assignments[0].team_model === 'account'">
                                                        <small>{{ booking.team_assignments[0].team.name }} <i class="el-icon-people" v-if="booking.team_assignments.length > 1"> (+{{booking.team_assignments.length - 1}})</i></small>
                                                        <el-rate disabled v-model="booking.team_assignments[0].team.rating"></el-rate>
                                                        <small><strong>({{booking.team_assignments[0].pay_rate_type == 'percent' ? booking.team_assignments[0].pay_rate + '%' : $currency + booking.team_assignments[0].pay_rate}}) {{ getEarned(booking) }}</strong></small>
                                                    </div>
                                                </div>
                                            </el-popover>
                                        </div>
                                    </div>
                                    <div class="summery-amount">
                                        <span class="s-amount">
                                            <p>Total time:</p>
                                            <span>{{ booking.duration | duration }}</span>
                                        </span>
                                        <span class="s-amount">
                                            <p>Discount:</p>
                                            <span>{{ $currency }}{{ booking.charge.discounts }} </span>
                                        </span>
                                        <span class="s-amount">
                                            <p>Tax:</p>
                                            <span>{{ $currency }}{{ booking.charge.tax_amount }} </span>
                                        </span>
                                        <!-- <small>Total time: <strong style="color: #1fb6ff"> {{ booking.duration | duration }} </strong></small>
                                        <small>Discount: <strong style="color: #1fb6ff"> {{ $currency }}{{ booking.charge.discounts }} </strong></small>
                                        <small>Tax: <strong style="color: #1fb6ff">{{ $currency }}{{ booking.charge.tax_amount }} </strong></small> -->
                                    </div>

                                    <div>
                                    <div v-if="booking.payment_type === 'card'">
                                        <div v-if="booking.charge.card" style="min-width: 150px; padding-top: 15px">
                                            <el-image v-if="booking.charge.card.cardType"  :src="require(`@/assets/icons/cards/${booking.charge.card.cardType}.png`)" class="charge-item-card" fit="fit"/>
                                            <el-image v-if="!booking.charge.card.cardType" :src="require(`@/assets/icons/cards/pay.svg`)" class="charge-item-card" fit="fit"></el-image>

                                            <div class="charge-item-card-details" style="font-weight: 800;">
                                                <small>**** **** **** {{ booking.charge.card.last4digits }}</small>
                                                <small>Expires: {{ booking.charge.card.expiryMonth }}/{{ booking.charge.card.expiryYear }}</small>
                                                <el-button size="mini" type="text" v-if="false">
                                                    Default <i class="el-icon-caret-bottom"/>
                                                </el-button>
                                            </div>
                                            <el-link style="font-size: 10px!important; margin-top: 5px; margin-left: 15px;" type="primary" size="mini" @click="chooseCard(booking)">(change default card)</el-link>
                                        </div>
                                        <div v-else>
                                            <p style="margin:0">No default card found for this booking.</p>
                                            <el-link style="font-size: 11px" type="danger" size="mini" @click="chooseCard(booking)">(choose card)</el-link>
                                        </div>
                                        </div>

                                        <!-- <div v-if="booking.payment_type !== 'card'">
                                            {{ booking.payment_type }}
                                        </div> -->
                                    </div>

                                    <div style="text-align: end;">
                                        <!-- <label style="font-size:12px;font-width: 600;">Total Amount</label>
                                        <small><strong style="font-size:16px;font-weight: 600;">{{ $currency }}{{ booking.charge.total_after_tax }}</strong></small>
                                        <small>Paid: {{ $currency }}{{ booking.charge.total_payments }}</small> -->
                                        <el-button class="is-round" v-if="booking.payment_type === 'card' && !booking.onhold_payment" :disabled="booking.charge.outstanding === 0" type="danger" size="mini" @click="putChargeOnHold(booking.charge, booking)" style="width: 160px; padding: 10px;">Put on Hold</el-button>
                                        <el-button class="is-round" v-if="booking.payment_type !== 'card' && !booking.onhold_payment" type="success" size="mini" plain @click="addManualPayment(booking, 'add')" style="width: 160px; padding: 10px; border-color: #0dce0c8a;">Mark as Paid</el-button>

                                     <div v-if="booking.payment_type === 'card'">
                                        <div class="booking-charge-card" style="margin-top: 10px;" v-if="booking.payment_type === 'card' && !(booking.onhold_payment)">
                                            <!-- <el-divider>Charge booking</el-divider> -->
                                            <el-input type="number" placeholder="Enter Amount" v-model="booking.charge.outstanding" :min="0" class="currencyInput">
                                                <!-- <span slot="prepend">{{$currency}}</span> -->
                                                <el-button slot="append" size="mini" type="primary" class="chargeAmount" @click="chargeBooking(booking.charge, booking)">Charge</el-button>
                                            </el-input>
                                        </div>
                                        <div v-if="booking.payment_type === 'card'   && !!(booking.onhold_payment)">
                                            <el-divider>A charge of {{$currency}}{{booking.onhold_payment.amount}} is on Hold</el-divider>
                                            <div style="margin:0 auto; text-align:center;">
                                                <el-button type="success" size="mini" @click="authorizeHold(booking, index)">Capture Hold</el-button>
                                                <el-button plain type="primary" size="mini" @click="releaseHold(booking, index)">Release Hold</el-button>
                                            </div>
                                        </div>

                                    </div>
                                    </div>

                                    <!--<div class="flex-row-center">
                                           <el-button @click="showChargeDrawer(booking, 'payments')" round size="mini" type="warning" v-if="booking.payment_type !== 'card' && !booking.forecasted">
                                               Add Payment
                                           </el-button>
                                           <el-button @click="showChargeDrawer(booking,'charge')" round size="mini" type="primary" v-if="booking.payment_type == 'card' && !booking.forecasted">
                                               Charge Booking
                                           </el-button>
                                           <el-button @click="confirmForecastedBooking(booking)" round size="mini" type="success" v-if="booking.forecasted">
                                               Confirm
                                           </el-button>
                                       </div>-->
                                </div>
                                <!-- <el-row style="margin: 10px 0px 10px 25px;">
                                    <el-col :sm="12">
                                        <div v-if="booking.service_details && booking.service_details.length > 0">
                                            <div class="services-rows">
                                        <span v-for="service in booking.service_details">
                                          <label>{{ service.name }}</label>
                                          <div v-html="getServiceOptions(booking, service)"></div>
                                        </span>
                                            </div>
                                        </div>
                                        <div v-if="booking.services && booking.services.length > 0">
                                            <div class="services-rows">
                                                <label>Extras</label>
                                                <span v-for="service in booking.services">
                                              <small v-for="extra in service.extras" v-if="extra.service_id === service.id"> {{ extra.quantity }}x {{ extra.name }} </small>
                                            </span>
                                            </div>
                                        </div>
                                    </el-col>  -->
                                    <!-- <el-col :sm="12" style="text-align: right" v-if="booking.payment_type === 'card'">
                                        <div class="booking-charge-card" style="margin-top: 10px;" v-if="booking.payment_type === 'card' && !(booking.onhold_payment)">
                                            <el-divider>Charge booking</el-divider>
                                            <el-input type="number" v-model="booking.charge.outstanding" :min="0" class="currencyInput">
                                                <span slot="prepend">{{$currency}}</span>
                                                <el-button slot="append" size="mini" type="primary" class="chargeAmount" @click="chargeBooking(booking.charge, booking)">Charge</el-button>
                                            </el-input>
                                        </div>
                                        <div v-if="booking.payment_type === 'card'   && !!(booking.onhold_payment)">
                                            <el-divider>A charge of {{$currency}}{{booking.onhold_payment.amount}} is on Hold</el-divider>
                                            <div style="margin:0 auto; text-align:center;">
                                                <el-button type="success" size="mini" @click="authorizeHold(booking, index)">Capture Hold</el-button>
                                                <el-button plain type="primary" size="mini" @click="releaseHold(booking, index)">Release Hold</el-button>
                                            </div>
                                        </div>

                                    </el-col>
                                </el-row>
                            </el-card>
                             <div @click="showDetail(booking)" class="action-btn" style="display: inline-block">
                                 <i class="el-icon-arrow-right"> </i>
                             </div>-->
                        </el-timeline-item>
                    </el-timeline>
                </el-checkbox-group>

                <no-data :show.sync="bookings.length === 0 && !loading"></no-data>

            </el-card>

        </el-scrollbar>
        <el-row>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination
                            :current-page.sync="current_page"
                            :page-size="page_size"
                            :total="total_records"
                            @current-change="loadCharges"
                            background
                            layout="total, prev, pager, next"
                    />
                </div>
            </el-col>
        </el-row>

        <el-dialog :close-on-press-escape="true" :destroy-on-close="true" :visible.sync="show_drawer" @close="handleAssignTeamClose" top="0vh" append-to-body size="50%" title="Booking Options">
            <div class="padding-2x panel-customer-info" style="width: 50%" v-if="selected_charge && selected_charge.booking">
                <h3>{{ selected_charge.booking.account.fullname }}</h3>
                <p>{{ selected_charge.booking.address.full_address }}</p>
                <p>
                    <strong style="color:black;">{{ $currency }} {{ selected_charge.total_after_tax }}</strong>
                </p>
            </div>

            <assign-team :booking.sync="selected_booking" @closed="handleAssignTeamClose" v-if="assign_team_drawer"/>

            <div style="padding: 20px;" v-if="show_charge_panel">
                <charge-payment :booking="selected_booking" :charge="selected_booking.charge" :intial_view.sync="charge_view" action="add"/>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="setupCards" :modal="true" :append-to-body="true" top="0vh" title="Manage Billing" @close="handleAssignTeamClose">
            <account-cards v-if="setupCards" :account="selected_booking.account" v-model="selected_booking.charge.cardId" button-placement="bottom"></account-cards>
            <div slot="footer" v-if="selected_booking && selected_booking.charge">
                <el-button round size="small" @click="setupCards = false">Cancel</el-button>
                <el-button type="primary" round size="small" :disabled="!selected_booking.charge.cardId" @click="updateChargeCard(selected_booking.charge)" :loading="operations">Set as default</el-button>
            </div>
        </el-dialog>


        <el-dialog :visible.sync="manualPayment" :modal="true" :append-to-body="true" top="0vh" title="Booking Payments" width="50%" @close="handleAssignTeamClose">
            <charge-payment intial_view="payments" :action="payment_view" v-if="manualPayment" :booking="selected_booking" :charge="selected_booking.charge"/>
        </el-dialog>


    </div>
</template>

<script>
    import AssignTeam from '../../components/AssignTeam'
    import ChargePayment from '../../components/ChargePayment'
    import AccountCards from '../../components/AccountCards'
    import Avatar from 'vue-avatar'
    import {VclTable} from 'vue-content-loading'
    import AccountAvatar from "../../components/AccountAvatar";
    import NoData from "../../components/NoData";
    import TeamSelect from "../../components/TeamSelect";
    import CompanyLocations from "../../components/CompanyLocations";
    import moment from 'moment'

    export default {
        components: {
            CompanyLocations,
            TeamSelect,
            NoData,
            AccountAvatar,
            AssignTeam,
            ChargePayment,
            AccountCards,
            Avatar,
            VclTable
        },
        data: () => {
            return {
                calendar_view: 'month',
                filter: '',
                range: [],
                bookings: [],
                temp_rating: 3,
                assign_team_drawer: false,
                selected_booking: false,
                show_drawer: false,
                selected_charge: false,
                show_payment: false,
                show_charge_panel: false,
                selected_card: '',
                confirm_amount: 0,
                charge_loading: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                loading: true,
                filter_team: [],
                filter_location: [],
                teams: [],
                charge_view: 'payments',
                locations: [],
                charges_stats: {
                    count: 0, total: 0, tax: 0, discount: 0, bookings: 0,
                    totalHold: 0, totalFailed: 0, totalCash: 0, totalCharged: 0, totalRevenue: 0
                },
                checkAll: false,
                checkedCharges: [],
                isIndeterminate: false,
                filter_payment_type: ['card', 'cash', 'check'],
                booking_status: 'active',
                dt_format: '',
                bookings_filter: 'active',
                setupCards: false,
                operations: false,
                manualPayment: false,
                payment_view: 'list',
                filter_payment_status: [],
            }
        },
        watch: {
            'range'(val) {
                this.loadCharges(1)
            }
        },

        computed: {},
        created() {
            this.range = [this.$moment().format('YYYY-MM-DD'), this.$moment().format('YYYY-MM-DD')]
            this.getTeams()
            this.getLocations()
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
        },

        methods: {
            chooseCard(booking) {
                this.selected_booking = booking
                this.setupCards = true
            },
            getLocations() {
                this.axios
                    .get("/companies/current/locations", {
                        params: {
                            filter: {
                                order: 'created_at DESC',
                                where: {active: true}
                            }
                        }
                    })
                    .then(res => {
                        this.locations = res.data;
                    })
                    .catch(err => {

                    })
                    .finally(_ => {

                    });
            },

            getTeams() {
                this.axios.get('/companies/current/teams')
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {

                    })
                    .then()
            },

            loadCharges() {

                //reset checkedchargs
                this.checkedCharges = []

                let start_date = this.$moment.utc(this.range[0]).startOf('day').format('YYYY-MM-DDTHH:mm')
                let end_date = this.$moment.utc(this.range[1] || this.range[0]).endOf('day').format('YYYY-MM-DDTHH:mm')
                let params = {
                    from: start_date,
                    to: end_date,
                    type: 'charges',
                    page: this.current_page,
                    recurring: (this.bookings_filter === 'recurring'),
                    status: (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter,
                };


                if (this.filter_payment_type.length > 0) {
                    params.where = {payment_type: {inq: this.filter_payment_type}}
                }


                if (this.filter_location.length > 0) {
                    if (!params.where) params.where = {}
                    params.where.locationId = {inq: this.filter_location};
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams';
                    params.targetTypeId = this.filter_team;
                }

                params.include = ["rating", {"charge": ["card", "payments"]}, {"team_assignments": "team"}, "account", "address", {"service_details": "pricing_variables"},]

                params.payment_status = this.filter_payment_status

                this.loading = true
                this.axios
                    .get('/bookings/schedule', {
                        params: params
                    })
                    .then(res => {
                        //classiffy
                        this.bookings = res.data.data
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false
                    })
                    .finally(() => {
                        this.getStats();
                    });
            },

            assignTeam(booking) {
                this.selected_booking = booking
                this.assign_team_drawer = true
                this.show_drawer = true
            },
            handleAssignTeamClose() {
                this.selected_booking = false
                this.assign_team_drawer = false
                this.show_payment = false
                this.show_drawer = false
                this.selected_charge = false
                this.show_charge_panel = false
                // reload charges
                this.loadCharges()
            },

            confirmForecastedBooking(booking) {
                this.$confirm('Are sure you want to confirm this booking?', 'Confirm Forecasted Booking')
                    .then(() => {
                        this.loading = true
                        this.axios.post('/bookings/' + booking.id + '/forecasted/confirm', {service_date: booking.service_date})
                            .then(res => {
                                this.$helpers.successHandle('Booking confirmed', this)
                                this.loadCharges()
                            })
                            .catch(err => {

                            })
                            .then(
                                _ => {
                                    this.loading = false
                                }
                            )
                    })
            },

            initCharge(booking) {
                if (booking.charge.card) this.selected_card = booking.charge.card.id
                this.selected_charge = booking.charge
                this.selected_charge.account = booking.account
                this.show_charge_panel = true
                this.show_drawer = true
            },


            getEarned(booking) {
                /*let team = booking.team_assignments
                if (team.pay_rate_type === 'percent') return parseFloat((booking.charge.total_before_tax * (team.pay_rate / 100)).toFixed(2))
                else if (team.pay_rate_type === 'hourly') {
                    return parseFloat((team.pay_rate * (booking.duration / 60)).toFixed(2))
                }*/
                return ""
            },

            markAsPaid(booking) {
                /* this.selected_charge = booking.charge;
                          this.selected_booking = booking;
                          this.show_payment = true;
                          this.show_drawer = true; */

                this.$router.push({name: 'dashboard_booking_view', params: {id: booking.id, service_date: booking.service_date}, query: {action: 'payments'}})
            },
            chargeCard(capture) {
                this.$router.push({name: 'dashboard_booking_view', params: {id: booking.id, service_date: booking.service_date}, query: {action: 'payments'}})

                return

                if (this.confirm_amount > this.selected_charge.total_after_tax - this.selected_charge.total_payments) {
                    this.$alert("You can't charge more than is outstanding: " + this.$currency + (this.selected_charge.total_after_tax - this.selected_charge.total_payments))
                }

                this.$confirm('Are you sure you want to ' + (capture ? 'charge ' : 'put on hold ') + this.$currency + this.confirm_amount, 'Charging Default Card')
                    .then(() => {
                        this.charge_loading = true
                        this.axios
                            .post('/charges/process-card', {
                                chargeId: this.selected_charge.id,
                                amount: parseFloat(this.confirm_amount),
                                capture: capture
                            })
                            .then(res => {
                                if (res.data.status == 'succeeded') {
                                    this.$message.success('Charge successfully completed')
                                } else if (res.data.status == 'requires_capture') {
                                    this.$message.success('Charge succesfully put on hold')
                                }

                                this.confirm_amount = 0
                                this.handleAssignTeamClose()
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(_ => {
                                this.charge_loading = false
                            })
                    })
                    .catch(() => {
                    })
            },


            viewBillingNote(charge) {
                this.$confirm(charge.billing_note + (charge.billing_note_author.fullname), 'Billing Note',
                    {
                        confirmButtonText: 'Edit',
                        cancelButtonText: 'Ok'
                    })
                    .then(() => {
                        this.addBillingNote(charge)
                    })
                    .catch(() => {
                    })
            },
            addBillingNote(charge) {
                this.$prompt('Enter billing note', 'Billing Note',
                    {
                        inputValue: (charge.billing_note || ''),
                        confirmButtonText: 'Save'
                    })
                    .then(({value}) => {
                        this.axios.patch('/charges/' + charge.id, {
                            billing_note: value,
                            billing_note_accountId: this.$auth.user().id
                        })
                            .then((res) => {
                                this.loadCharges()
                            })
                            .catch(err => {

                            })
                    })
                    .catch()
            },
            showDetail(booking) {
                this.$router.push({name: 'dashboard_booking_view', params: {id: booking.id, service_date: booking.service_date}})
            },
            getStats() {

                let start_date = this.$moment.utc(this.range[0]).startOf('day').format('YYYY-MM-DDTHH:mm')
                let end_date = this.$moment.utc(this.range[1] || this.range[0]).endOf('day').format('YYYY-MM-DDTHH:mm')
                let params = {
                    from: start_date,
                    to: end_date,
                    type: 'charges',
                    page: this.current_page,
                    recurring: (this.bookings_filter === 'recurring'),
                    status: (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter,
                };


                if (this.filter_payment_type.length > 0) {
                    params.where = {payment_type: {inq: this.filter_payment_type}}
                }


                if (this.filter_location.length > 0) {
                    if (!params.where) params.where = {}
                    params.where.locationId = {inq: this.filter_location};
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams';
                    params.targetTypeId = this.filter_team;
                }

                params.include = ["rating", {"charge": ["card", "payments"]}, {"team_assignments": "team"}, "account", "address", {"service_details": "pricing_variables"},]

                params.payment_status = this.filter_payment_status

                this.axios.get('/charges/statistics',
                    {
                        params: params
                    })
                    .then(res => {
                        this.charges_stats = res.data;
                    });
            },
            handleCheckAllChange(val) {
                let chargeIds = []
                this.bookings.forEach((booking) => {
                    chargeIds.push(booking.charge.id)
                })
                this.checkedCharges = val ? chargeIds : [];
                this.isIndeterminate = false;
            },
            handleCheckedChargesChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.bookings.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.bookings.length;
            },
            actionCommand(command) {

                if (this.checkedCharges.length === 0) {
                    return this.$message('Select booking charges to proceed')
                }


                let str = ""
                if (command === 'charge')
                    str = "charge"
                else
                    str = "put on hold"

                this.$confirm('Are sure you want to ' + str + " these bookings")
                    .then(() => {
                        this.loading = true;
                        this.axios.post('/charges/bulk-update', {
                            ids: this.checkedCharges,
                            action: command
                        })
                            .then(res => {
                                this.$message('Booking successfully ' + str)
                                this.loadCharges()
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    })

            },
            getServiceOptions(booking, full_service) {

                if (!full_service) return

                if (full_service.hourly && booking.services) {
                    let service = booking.services.find(srv => {
                        return srv.id === full_service.id;
                    });

                    if (service) return "<small>" + service.hourly.teams + " teams for " + service.hourly.hours + " hrs" + "</small>";
                    else return "";
                }

                let content = "";

                if (full_service.pricing_variables && full_service.pricing_variables.length > 0) {
                    for (let x = 0; x < full_service.pricing_variables.length; x++) {
                        let selected_pv;

                        let service = booking.services.find(srv => {
                            return srv.id === full_service.id;
                        });

                        if (service && service.pricing_variables) {
                            let pvv = service.pricing_variables.find(pv => {
                                return pv.id === full_service.pricing_variables[x].id;
                            });

                            if (pvv) {
                                if (pvv.quantity) content += "<small class='service-title'  style='display: inline-block; font-size: 12px;font-weight: 800;color: #909399;margin-right: 10px'>" + pvv.quantity + "  " + full_service.pricing_variables[x].name + "</small>";
                                else {
                                    if (full_service.pricing_variables[x].prices) {
                                        let price = full_service.pricing_variables[x].prices.find(price => {
                                            return price.id === pvv.price_id;
                                        });

                                        if (price)
                                            content += "<small class='service-title' style='display: inline-block; font-size: 12px;font-weight: 800;color: #909399;margin-right: 10px'>" + full_service.pricing_variables[x].name + " : " + (price.label || price.max_qty + " - " + price.min_qty) + "</small>";
                                        else
                                            content += "<small class='service-title'  style='display: inline-block; font-size: 12px;font-weight: 800;color: #909399;margin-right: 10px'>" + full_service.pricing_variables[x].name
                                    } else {
                                        content += "<small class='service-title'  style='display: inline-block; font-size: 12px;font-weight: 800;color: #909399;margin-right: 10px'>" + full_service.pricing_variables[x].name
                                    }

                                }
                            }
                        }
                    }
                }

                return content;
            },

            getServiceExtras(service) {
                if (booking.extras && booking.extras.length > 0)
                    booking.extras.forEach(extra => {
                        //let full_extra = this.service_extras
                    });
                return "";
            },
            putChargeOnHold(charge, booking) {
                //charge boking
                this.selected_booking = booking
                let amount = Number(parseFloat(charge.outstanding).toFixed(2))

                this.$confirm('Are you sure you want to put on hold ' + this.$currency + amount, "")
                    .then(() => {
                        //execute hold
                        this.loading = true;
                        this.axios
                            .post("/charges/process-card", {
                                chargeId: charge.id,
                                amount: parseFloat(charge.outstanding),
                                capture: false
                            })
                            .then(res => {
                                if (res.data.status == "succeeded") {
                                    this.$message.success("Charge successfully completed");
                                } else if (res.data.status == "requires_capture") {
                                    this.$message.success("Charge succesfully put on hold");
                                }
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(_ => {
                                this.loadCharges();
                            });
                    })
            },
            reloadBookingCharge(charge) {
                this.axios.get('/charges/' + charge.id, {
                    params: {
                        filter: {
                            include: ["card"]
                        }
                    }
                })
                    .then(res => {
                        //this.bookings[index].charge = res.data
                        this.$set(this.selected_booking, 'charge', res.data)
                    })
                    .catch((err) => {
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            updateChargeCard(charge) {
                this.operations = true
                this.axios.patch('/charges/' + charge.id, {
                    cardId: charge.cardId
                })
                    .then(res => {
                        this.$set(this.selected_booking, 'charge', res.data)
                        this.setupCards = false
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.operations = false
                    })
            },
            chargeBooking(charge, booking) {
                //charge boking

                if (Number(charge.outstanding) <= 0) {
                    this.$alert("Charging " + this.$currency + Number(charge.outstanding) + ' is not allowed')
                    return;
                }

                this.$confirm('Are you sure you want to charge ' + this.$currency + charge.outstanding, "Charge this booking")
                    .then(() => {
                        //execute hold
                        this.loading = true;
                        this.selected_booking = booking

                        this.axios
                            .post("/charges/process-card", {
                                chargeId: charge.id,
                                amount: parseFloat(charge.outstanding),
                                capture: true
                            })
                            .then(res => {
                                if (res.data.status == "succeeded") {
                                    this.$message.success("Charge successfully completed");
                                } else if (res.data.status == "requires_capture") {
                                    this.$message.success("Charge succesfully put on hold");
                                }
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(_ => {
                                this.reloadBookingCharge(charge)
                            });
                    })
            },
            addManualPayment(booking, view) {
                //show manual payment
                this.selected_booking = booking
                this.payment_view = view
                this.manualPayment = true
            },
            authorizeHold(booking, index) {
                //this should capture hold on booking
                this.selected_booking = booking

                this.$confirm('Are you sure you want to charge this payment? ' + this.$currency + booking.onhold_payment.amount)
                    .then(() => {
                        this.loading = true;
                        this.axios.put("/payments/" + booking.onhold_payment.id + '/capture', {
                            amount: parseFloat(booking.onhold_payment.amount)
                        })
                            .then(res => {
                                this.$message("Payment successfully captured")
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loadCharges();
                            })
                    })
            },
            releaseHold(booking) {
                this.selected_booking = booking
                this.$confirm('Are you sure you want to release hold of  ' + this.$currency + booking.onhold_payment.amount)
                    .then(() => {
                        this.loading = true
                        this.axios.put("/payments/" + booking.onhold_payment.id + '/refund', {
                            amount: parseFloat(booking.onhold_payment.amount)
                        })
                            .then(res => {
                                this.$message("Payment successfully released")
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loadCharges();
                            })
                    })
            }
        }
    }
</script>

<style lang="scss">
    .app-section.charges {

        .el-timeline {
            padding: 0px;

            .el-timeline-item__tail {
                position: absolute;
                left: 4px;
                height: 100%;
                border-left: 1px dashed $launch-primary-color;
            }

            .el-timeline-item__node {
                background-color: $launch-primary-color;
            }

            .charge-card {
                // box-shadow: none;
                // border-right: none;
                // border-top-right-radius: 0px;
                // border-bottom-right-radius: 0px;

                small {
                    display: block;
                }

                &.forecasted {
                    background: #f3f3f3;
                }

                &:hover {
                    -webkit-box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                    box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                }
                .booking-charge-card {
                    .currencyInput {
                        width: 270px;
                        height: 34px;
                        input[type='number'] {
                        border-top-left-radius: 5px;
                        border-bottom-left-radius: 5px;
                        height: 34px;
                        }
                        div {
                            border-top-right-radius: 20px;
                            border-bottom-right-radius: 20px;
                        }
                    }

                }
                .summery-amount {
                   span {
                     &.s-amount {
                         display: block;
                         height: 18px;
                     span {
                         color: rgb(31, 182, 255);
                         font-size: 13px; 
                         font-weight: 600;
                     }
                     p {
                         width: 82px; 
                         display: inline-block; 
                         font-size: 13px;
                         margin: 0;
                        }
                    }
                  }
                }
                .name-address {
                  display: inline-block;
                    span {
                    font-size: 12px;
                        &.p-name {
                        margin-left: 15px;
                        }
                        &.p-address {
                        margin-left: 25px; 
                        }
                    }
                }
                .time-and-services {
                    margin: 10px 0px 0px 30px;
                    .time-frequency {
                        display: inline-block;
                        small {
                        font-size: 14px;
                        }
                    }
                    .b-services {
                        display: inline-block;
                        margin-left: 25px;
                        margin-top: 0;
                        position: absolute;
                    }
                    span.service-title {
                        display: inline-block; 
                        font-size: 12px;
                        font-weight: 800;
                        color: #909399;
                        margin-right: 10px;
                    }
                }
            }

            .charge-headline {
                .el-tag {
                    font-style: normal;
                    font-size: 11px;

                    height: 20px;
                    line-height: 20px;
                    font-weight: bold;

                    &.onhold {
                        height: 20px;
                        line-height: 20px;
                        font-weight: bold;
                        background: #F44336;
                    }
                }
            }

            .el-input-group__append {
                background: $launch-primary-color;
                color: white;

                .el-button {
                    width: 96px;
                }
            }

            .el-timeline-item__content {
                position: relative;
            }

            .action-button {
                position: absolute;
                right: 40px;
                top: 10px;
            }

            .action-btn {
                position: absolute;
                width: 44px;
                background: #f3f3f3;
                line-height: 93px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                border: 1px solid #f3f3f3;
                cursor: pointer;
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;

                &:active {
                    background: gray;
                }
            }
        }

        .el-divider--vertical {
            display: inline-block;
            width: 1px;
            height: 4em;
            margin: 0 8px;
            vertical-align: middle;
            position: relative;

            &.divider-mini {
                height: 1em;
            }
        }


        .el-range-separator {
            width: 20px;
            color: gray;
        }

        .to {
            height: 35px;
            line-height: 35px;
            display: inline-block;
            width: 25px;
            color: gray;
        }

        .el-radio-group {
            &.options {
                .el-radio-button {
                    .el-radio-button__inner {
                        border: none;
                        font-size: 12px;
                        padding: 20px 30px;
                        text-transform: uppercase;
                        border-radius: 0px;
                        border-bottom: 2px solid white;
                    }

                    &.is-active {
                        .el-radio-button__inner {
                            background: white;
                            color: $launch-primary-color;
                            box-shadow: none;
                            border-bottom: 2px solid $launch-primary-color;
                        }
                    }
                }
            }
        }

        .main-filters {
            .el-radio-group {
                border: 1px solid #dcdfe6;
                padding: 2px;
                border-radius: 25px;

                .el-radio-button {
                    font-size: 12px;

                    .el-radio-button__inner {
                        border: none;
                    }

                    &.is-active {
                        .el-radio-button__inner {
                            border-radius: 25px !important;
                        }
                    }
                }
            }

            .el-radio-button:first-child .el-radio-button__inner {
                border-radius: 25px 0 0 25px;
            }

            .el-radio-button:last-child .el-radio-button__inner {
                border-radius: 0 25px 25px 0;
            }

            .filter {
                margin-right: 10px;
            }
        }

        .appointments {
            min-height: 500px;
        }

        .border-left {
            box-shadow: -2px 0px 5px 1px #eeeeee;
        }

        .charge-item-card {
            width: 40px;
            float: left;
            margin-right: 5px;
        }
        .header-icon {
             width: 25px;
             overflow: unset;
        }
        .header-icon-text {
             padding-left: 8px !important;
             >span{
                 font-weight: 800 !important;
                 font-size: 12px !important;
                 color: #4d6b7f !important;
             }
        }
        .header-booking-charge {
            display: inline-block; 
            float: right;
            label {
                font-size: 16px;
                // font-weight: 600; 
                padding-right: 10px;
            }
            small {
                margin-right: 20px;
            >strong
            {
              font-size: 16px;
              font-weight: 800; 
                &.booking-total-amount{
                  color: #f56c6c
            }
            }
        }
        }

        .charge-item-card-details {
            // width: calc(100% - 70px);
            // display: inline-block;

            small {
                font-size: 9px;
            }

            .el-button {
                color: #333;
            }
        }

        .charge-item {
            span {
                display: block;
                font-size: 11px;
            }
        }


    }
</style>
