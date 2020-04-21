<template>
  <div class="signin-page unauth">

    <el-row class="flex-row-center block-center" style="max-width: 640px;">
      <el-col :sm="24" :md="24" :xs="24">
        <el-row :gutter="20">

          <div style="text-align: center; margin-top: 40px;">
            <svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="240px" height="48px"  >
              <image
                x="0px"
                y="0px"
                width="200px"
                height="18px"
                xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                />
            </svg>
          </div>

          <el-card shadow="always">
            <p class="text-center" style="font-size: 70px;">
              500
            </p>
            <p class="text-center" style="font-size: 17px;">
              Server Error!
            </p>
            <p class="text-center" style="font-size: 17px;">
              <a @click="goBack" class="text-center block-center full-width signup-link pointer-cursor">
                Back
              </a>
            </p>
            <p class="text-center" style="font-size: 17px;">              
              <router-link to="/" class="text-center block-center full-width signup-link">
                Home
              </router-link>
            </p>         
          </el-card>

        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
    export default {
        data() {
            return {
                back: true
            };
        },
        methods: {
            goBack() {
                if (this.back) {
                    this.$router.back();
                } else {
                    // taking the to the correct dashoard
                    this.$router.replace({name: 'landing_page'});
                }
            },
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
  @import "Login";
</style>
