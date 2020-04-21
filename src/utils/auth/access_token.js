/* eslint-disable one-var */
module.exports = {

  request: function (req, token) {
    this.options.http._setHeaders.call(this, req, { 'Authorization': token })
  },

  response: function (res) {
    // if the path was a login - then get and save the id as the token
    if (res.data && res.data.hasOwnProperty('ttl') && res.data.hasOwnProperty('userId')) {
      let token = res.data.id

      return token
    }
  }
}
