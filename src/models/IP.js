var _ = require('lodash');

function IP(title, ipAddress) {
  _.extend(this, {
    title: title,
    ipAddress: ipAddress.map(function (c) {
      return {
        name: c[0]
      }
    })
  });
}

module.exports = IP;
