// duration_filter.js


// This exports the plugin object.
export default {

  install: function (Vue, options) {

    Vue.filter('duration', (value) => {

      let result;
      let minutes;
      let hours;
      if (!value) return '--'
      else if (isNaN(value)) return '--'

      value = Math.floor(value)

      minutes = value % 60;
      hours = (value - minutes) / 60;
      result = '--'

      if (hours > 0) {
        result = hours + (hours === 1 ? "HR" : "HR");
      }

      if (minutes > 0 && hours > 0) {
        result += ` ${minutes}${minutes === 1 ? "MIN" : "MINS"}`;
      } else if (minutes > 0) {
        result = `${minutes}${minutes === 1 ? "MIN" : "MINS"}`;
      }

      return result;

    })
  }
}
