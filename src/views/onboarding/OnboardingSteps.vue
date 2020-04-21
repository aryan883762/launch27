<template>
    <el-col class="hidden-sm-and-down">
        <div class="steps" style="margin-bottom: 40px;">
            <a :class="{ active: illustration == 'company', success: current_step >= 1 }"><i>1</i> Company Details</a>
            <img :class="{ active: illustration == 'company', success: current_step >= 1 }" src="@/assets/svgs/onboarding/arrow.svg" svg-inline/>
            <a :class="{ active: illustration == 'logo', success: current_step >= 2 }"><i>2</i> Logo</a>
            <img :class="{ active: illustration == 'logo', success: current_step >= 2 }" src="@/assets/svgs/onboarding/arrow.svg" svg-inline/>
            <a :class="{ active: illustration == 'getting_started',  success: current_step === 3 }"> <i>3</i> Launch </a>
        </div>
    </el-col>
</template>

<script>
    export default {
        props : {
          illustration :{},
          current_step : {}
        },
        data(){
            return {

            }
        },
        methods:{

        }
    }
</script>