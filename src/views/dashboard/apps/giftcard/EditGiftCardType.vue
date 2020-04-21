<template>
  <el-card shadow="never" v-loading="loading">
    <el-row :gutter="20">
      <el-form ref="giftCardTypeForm" :model="giftCardType" :rules="rules" onSubmit="return false;">
        <el-col :sm="12" :md="12" :xs="24">
          <el-form-item label="Amount Options" prop="amounts" class="full-label-form-item">
            <el-tag :key="amount" v-for="amount in giftCardType.amounts" closable :disable-transitions="false" @close="handleAmountClose(amount)"> {{ $currency }}{{ amount }} </el-tag>
            <el-input type="number" v-if="amountInputVisible" v-model.number="amountInputValue" min="1" ref="saveAmountInput" size="mini" @keyup.enter.native="handleAmountInputConfirm" @blur="handleAmountInputConfirm" class="amount-input">
              <span slot="prepend">{{ $currency }}</span>
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showAmountInput">+ New Amount</el-button>
          </el-form-item>

          <el-form-item label="Default Message" prop="description">
            <el-input v-model="giftCardType.description" rows="3" type="textarea" />
          </el-form-item>
          <el-form-item prop="show_code">
            <el-checkbox v-model="giftCardType.show_code" label="Show Gift Card Code"></el-checkbox>
          </el-form-item>
          <el-form-item label="Background Images" prop="background_images" class="full-label-form-item">
            <el-upload :headers="getHeaders()" :action="getFileUrl()" :on-remove="handleRemove" :file-list="imageList" :on-success="handleSuccess" list-type="picture" :on-preview="handlePreview">
              <el-button type="primary" size="mini" plain round>Click to upload</el-button>
              <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :md="12" :xs="24">
          <preview-gift-card :background-image="previewBackgroundImage" :description="giftCardType.description" :show-code="giftCardType.show_code" :currency="$currency" />

          <div class="divider-3x" />
          <el-form-item>
            <el-button type="primary" @click="saveGiftCardType()" round>
              Save Changes
            </el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
  </el-card>
</template>

<script>
import PreviewGiftCard from "./components/PreviewGiftCard.vue";

export default {
  components: { PreviewGiftCard },

  data: () => {
    return {
      loading: true,
      amountInputVisible: false,
      amountInputValue: "",
      imageList: [],
      previewBackgroundImage: "",
      giftCardType: {
        description: "",
        show_code: false,
        amounts: [],
        background_images: []
      },
      rules: {
        show_code: [{ required: true, message: "Please enter a value", trigger: "change" }],
        background_images: [{ type: "array", required: true, message: "Please upload an image", trigger: "change" }]
      }
    };
  },

  created() {
    this.loadGiftCardType();
  },

  methods: {
    saveGiftCardType() {
      this.$refs["giftCardTypeForm"].validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.giftCardType.id) {
            this.axios
              .put("/companies/current/giftCardTypes/" + this.giftCardType.id, this.giftCardType)
              .then(res => {
                this.setGiftCardType(res);
                this.$message.success("Changes saved");
              })
              .catch(err => {})
              .then(() => {});
          } else {
            this.axios
              .post("/companies/current/giftCardTypes", this.giftCardType)
              .then(res => {
                this.setGiftCardType(res);
                this.$message.success("Changes saved");
              })
              .catch(err => {})
              .then(() => {});
          }
        } else {
          return false;
        }
      });
    },

    loadGiftCardType() {
      this.loading = true;

      this.axios.get("/companies/current/giftCardTypes").then(res => {
        this.setGiftCardType(res);
      });
    },

    setGiftCardType(res) {
      if (res.data && res.data[0]) {
        this.giftCardType = res.data[0];
        this.imageList = this.giftCardType.background_images.map((url, index) => ({
          url: url,
          name: "Image " + (index + 1)
        }));
        if (this.giftCardType.background_images[0]) {
          this.setPreviewImage(this.giftCardType.background_images[0]);
        }
      }
      this.loading = false;
    },

    handleAmountClose(amount) {
      this.giftCardType.amounts.splice(this.giftCardType.amounts.indexOf(amount), 1);
    },

    showAmountInput() {
      this.amountInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveAmountInput.$refs.input.focus();
      });
    },

    handleAmountInputConfirm() {
      var amountInputValue = this.amountInputValue;
      if (amountInputValue) {
        this.giftCardType.amounts.push(amountInputValue);
      }
      this.amountInputVisible = false;
      this.amountInputValue = "";
    },

    handleSuccess(response, file, fileList) {
      var url = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + response.result.files.file[0].name;
      this.giftCardType.background_images.push(url);
      this.setPreviewImage(url);
    },

    handlePreview(file) {
      this.setPreviewImage(file.url);
    },

    getHeaders() {
      return { Authorization: this.$auth.token() };
    },
    getFileUrl() {
      return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
    },

    handleRemove(file, fileList) {
      this.giftCardType.background_images.splice(this.giftCardType.background_images.indexOf(file.url), 1);
    },

    setPreviewImage(src) {
      this.previewBackgroundImage = src;
    }
  }
};
</script>

<style>
.full-label-form-item label.el-form-item__label {
  width: 100%;
  text-align: left;
}

.amount-input input {
  width: 100px !important;
}

.el-upload-list--picture .el-upload-list__item {
  width: 47%;
  display: inline-block;
  margin-right: 10px;
}
</style>
