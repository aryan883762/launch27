<template>
  <div class="report-section wrapper">
    <el-row :gutter="15" class="chart-upper-section">
      <el-col :md="12">
        <el-card>
          <line-chart style="max-width: 400px" :chart-data="datacollection"></line-chart>
        </el-card>
      </el-col>
      <el-col :md="12">
        <el-row :gutter="10">
          <el-col :md="12">
            <el-card>
              <line-chart :chart-data="datacollection"></line-chart>
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card>
              <line-chart :chart-data="datacollection"></line-chart>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-top: 15px">
          <el-col :md="12">
            <el-card>
              <p>Oder Value</p>
              <h3>$58,907.00</h3>
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card>
              <p>Revenue</p>
              <h3>$45,250.25</h3>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-row :gutter="15" class="chart-upper-section">
      <el-col :md="6">
        <el-card>
          <p><strong>Email</strong></p>
          <el-row>
            <el-col :md="20">Open rate</el-col>
            <el-col :md="24">
              <el-progress :percentage="50"></el-progress>
            </el-col>
          </el-row>
          <el-row>
            <el-col :md="20">Sent</el-col>
            <el-col :md="24">
              <el-progress :percentage="80"></el-progress>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <el-row class="report-table">
            <el-col :md="12">Notifications</el-col>
            <el-col :md="12"><a href="#" class="pull-right">View all</a></el-col>
            <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="date" width="180"> </el-table-column>
              <el-table-column prop="name" width="180"> </el-table-column>
            </el-table>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="12">
        <el-card class="center-content">
          <h5>AVERAGE DEAL SIZE</h5>
          <el-row>
            <el-col :md="12" class="right-side">
              <p>+35%</p>
              <h4>$58,907.00</h4>
              <p>per rep</p>
            </el-col>
            <el-col :md="12" class="left-side">
              <p>+35%</p>
              <h4>$58,907.00</h4>
              <p>per rep</p>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from "./utils/LineChart.js";

export default {
  components: {
    LineChart
  },
  data() {
    return {
      datacollection: [],
      tableData: [
        {
          date: "2016-05-03",
          name: "Tom"
        },
        {
          date: "2016-05-02",
          name: "Tom"
        }
      ]
    };
  },
  mounted() {
    this.fillData();
  },
  methods: {
    fillData() {
      this.datacollection = {
        labels: [this.getRandomInt(), this.getRandomInt()],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt()]
          }
        ]
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }
  }
};
</script>

<style lang="scss" src="./styles/Reports.scss" />
