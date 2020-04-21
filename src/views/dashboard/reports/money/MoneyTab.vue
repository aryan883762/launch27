<template>
    <el-row>
        
        <!-- <el-option value="totalsales" label="Total Sales"/>
        <el-option value="totalsalesbybookingtype" label="Total sales by booking type"/>
        
        <el-option value="totalsalesbyservice" label="Total sales by services" :disabled="true"/>
        <el-option value="totalsalesbyteams" label="Total sales by teams" :disabled="true"/>
        <el-option value="totalsalesbysource" label="Total sales by source" :disabled="true"/>
        <el-option value="recurrringsales" label="Recurring sales" :disabled="true"/>
        <el-option value="newsales" label="New sales" :disabled="true"/>
        <el-option value="giftcardsales" label="Gift card sales" :disabled="true"/>
        <el-option value="promotionsales" label="Promotion sales" :disabled="true"/>
        <el-option value="promotiondiscountused" label="Promotion discounts used" :disabled="true"/>
        <el-option value="failedpayments" label="Failed payments" :disabled="true"/>
        <el-option value="averagesale" label="Average sale" :disabled="true"/>
        <el-option value="totalcancellations" label="Total cancellations" :disabled="true"/>
        <el-option value="bookingsvswagesprofit" label="Profit (bookings vs wages)" :disabled="true"/> -->

        <!-- Chart -->
        <el-row>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales :bookings.sync="bookings" :loading.sync="loading"></total-sales>
                    <span style="color:red;">* This does not include forecasted sales</span>
                </el-card>    
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-booking-type :bookings.sync="bookings" :loading.sync="loading"></total-sales-by-booking-type>
                    <span style="color:red;">* This does not include forecasted sales</span>
                </el-card>
            </el-col>
            <!-- <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-booking-extra :bookings.sync="bookings" :loading.sync="loading"></total-sales-by-booking-extra>
                </el-card>
            </el-col> -->
            <!-- <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-services v-if="money_chart_type === 'totalsalesbyservice'"></total-sales-by-services>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-team v-if="money_chart_type === 'totalsalesbyteams'"></total-sales-by-team>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-source v-if="money_chart_type === 'totalsalesbysource'"></total-sales-by-source>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <recurring-sales v-if="money_chart_type === 'recurrringsales'"></recurring-sales>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <new-sales v-if="money_chart_type === 'newsales'"></new-sales>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <gift-card-sales v-if="money_chart_type === 'giftcardsales'"></gift-card-sales>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <promotion-sales v-if="money_chart_type === 'promotionsales'"></promotion-sales>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <promotion-discounts-used v-if="money_chart_type === 'promotiondiscountused'"></promotion-discounts-used>
                </el-card>
            </el-col> -->
        </el-row>
    </el-row>
</template>

<script>
    import TotalSales from './TotalSales.vue'
    import TotalSalesByBookingType from './SalesByBookingType.vue'
    import TotalSalesByBookingExtra from './SalesByBookingExtra.vue'
    
    // import TotalSalesByServices from './SalesByServices.vue'
    // import TotalSalesByTeam from './SalesByTeams.vue'
    // import TotalSalesBySource from './SalesBySource.vue'
    // import RecurringSales from './RecurringSales.vue'
    // import NewSales from './NewSales.vue'
    // import GiftCardSales from './GiftCardSales.vue'
    // import PromotionSales from './PromotionSales.vue'
    // import PromotionDiscountsUsed from './PromotionDiscountsUsed.vue'

    export default {
         components: {
            TotalSales,
            TotalSalesByBookingType,
            TotalSalesByBookingExtra
            // TotalSalesByServices,
            // TotalSalesByTeam,
            // TotalSalesBySource,
            // RecurringSales,
            // NewSales,
            // GiftCardSales,
            // PromotionSales,
            // PromotionDiscountsUsed
        },
        props: {
            bookings: {
                type: Object,
                required: true
            },
            loading:{
                type: Boolean,
                required: true
            }
        }
    }
</script>