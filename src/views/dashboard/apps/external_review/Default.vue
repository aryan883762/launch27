<template>
  <el-container>
    <el-row class="full-width" v-loading="loading">
      <div class="title">
        <h4>Review Redirect</h4>
        <span>Redirect customers to external review sites of your choosing.<br/></span>

        <el-row v-if="$can('manage', 'role_customer')">
          <!-- <el-link @click="$router.push({name: 'booking_with_referral'})" target="_blank">{{ referral_link }}</el-link> -->
          <router-link  :to="{path: relative_referral_link}">
            {{ full_referral_link }}
          </router-link>
          <a class="card-details"><i></i></a>
        </el-row>
      </div>

      <el-card  shadow="never" style="border:none; margin-bottom: 5px;">
        <!-- Filter for admin goals -->
        <el-row class="bg-white row-filter full-width"> 

          <el-form label-width="120px" label-position="top" size="mini">
            <div v-for="loc in locReview" :key="loc.id">
              <el-row>
                <h4>{{loc.name}}</h4>
              </el-row>

              <el-row>
                <el-col :span="14">
                  <el-form-item label="External Review Link">
                    <el-input v-model="loc.externalReview.redirect_link"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3" :offset="1">
                  <el-form-item label=" ">
                    <a :href="appendProtocol(loc.externalReview.redirect_link)" target="_blank" v-if="loc.externalReview.redirect_link !== ''">
                      <el-button type="text">
                        <u>Verify</u>
                      </el-button>
                    </a>
                  </el-form-item>
                </el-col>
                <el-col :span="3" :offset="1">
                  <el-form-item label="Rating Threshold">
                    <el-input-number size="small" v-model="loc.externalReview.rating_threshold" :min="0" :max="5" :step="0.5" step-strictly></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-divider></el-divider>
            </div>
            <el-row>
              <el-form-item>
                <el-button type="primary" @click="saveExternalReviews()" round>Save</el-button>
              </el-form-item>
            </el-row>
          </el-form>
        </el-row>
      </el-card>
    </el-row>
  </el-container>
</template>

<script>

  export default {
    name: 'Home',
    components: {
    },
    data() {
      return {
        locReview: [],
        updatedLocReview:[],
        loading: true
      };
    },
    created() {
      this.loadLocations();
    },
    methods: {
      loadLocations(){
        this.loading = true;

        this.axios.get('/companies/current/locations',
          { params: 
            { filter: 
              { 
                include: ["externalReview"],
                where: {active: true}
              }
            }
          }
        )
        .then((response)=>{
          response.data.forEach(loc => {
            if(!loc.externalReview){
              loc.externalReview = {
                redirect_link: "",
                rating_threshold: 0,
                locationId: loc.id,
                companyId: loc.companyId
              };
            }
          });

          this.locReview = response.data;
          this.loading = false;
        })
        .catch((error)=>{
          this.locReview = [];
          this.loading = false;
        });
      },
      saveExternalReviews(){
        let reviews = [];
        this.locReview.forEach(loc => {
          delete loc.externalReview.id;
          loc.externalReview.redirect_link = this.appendProtocol(loc.externalReview.redirect_link);
          reviews.push(loc.externalReview);
        });

        this.axios.post('/external_reviews/upsert-external-review', reviews)
          .then((response) => {
            this.$helpers.successHandle('Saved Successful');
          })
          .catch(function (error) {
          });
      },
      appendProtocol(link){
        if(link === "" || link.toLowerCase().startsWith("http://") || link.toLowerCase().startsWith("https://")){
          return link;
        }else{
          return "http://" + link;
        }
      }
    }
  };
</script>

<style  scoped lang="scss">
  .el-dialog{
    .el-form label {
        margin-top: 13px;
        font-size: 10px;
    }
  }

  .search {
    width: 200px;
    margin-right: 10px;
  }

  .title {
    text-align: center;
    margin-bottom: 20px;

    span {
      font-size: 12px;
    }

    p, h4 {
      margin: 0px;
    }
  }

  .app-section.apps{
    .app-description{
      font-size:15px;
      margin-bottom:10px;
      height: 220px;
      width: 350px;
      text-align: left;

      .card-details{
        font-size: 12px;
        width: 300px;
      }
    }

    .el-card__footer {
      bottom: 0;

      .pull-center{
        margin-left: 40px; 
      }
    }
  }
</style>
