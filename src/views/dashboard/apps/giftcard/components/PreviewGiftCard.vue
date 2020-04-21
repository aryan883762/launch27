<template>
  <el-card class="box-card gift-card-preview">
    <div slot="header" class="clearfix">
      <el-row class="gift-card-title">
        <el-col :span="18">
          {{ company.business_name }}
        </el-col>
        <el-col :span="6">
          <span class="pull-right">{{ currency }}{{ amount }}</span>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <div class="p-absolute">
        <el-image :src="backgroundImage" fit="contain" alt="background image">
          <div slot="error" class="image-slot"></div>
        </el-image>
      </div>
      <el-col :span="15" :offset="9" class="giftcard-info">
        <el-row>
          <el-col>
            Dear <span class="text-bold">{{ recipientName }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-italic description">
            {{ description }}
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-bold">
            {{ gifterName }}
          </el-col>
        </el-row>
        <el-row class="giftcard-code-row">
          <el-col v-if="showCode">
            code: XXXXXXXXX
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  name: "preview-gift-card",
  props: {
    amount: {
      type: Number,
      default: 20
    },
    backgroundImage: {
      type: String
    },
    recipientName: {
      type: String,
      default: "Scott Smith"
    },
    gifterName: {
      type: String,
      default: "Adam David"
    },
    description: {
      type: String
    },
    showCode: {
      type: Boolean
    },
    currency: {
      type: String
    }
  },

  data: () => {
    return {
      company: {
        business_name: "Business Name"
      }
    };
  },

  created() {
    this.loadCompany();
  },

  methods: {
    loadCompany() {
      let url = "/companies/current";
      if (this.$can("manage", "role_anonymous")) {
        url = "/companies/" + this.$company.id;
      }
      this.axios.get(url).then(res => {
        this.company = res.data;
      });
    }
  }
};
</script>
<style>
.gift-card-preview {
  max-width: 600px;
}

.gift-card-preview .el-card__header {
  background-color: #777777;
  border-bottom: none;
}
.gift-card-preview .el-card__body {
  background-color: #999999;
  padding: 0px;
}

.gift-card-title {
  color: white;
  font-size: 14px;
}

.gift-card-preview .description {
  height: 90px;
  padding-top: 5px;
  margin-bottom: 5px;
  overflow: hidden;
}

.giftcard-info {
  background-color: white;
  opacity: 0.6;
  padding: 20px;
}

.giftcard-code-row {
  min-height: 18px;
}
</style>
