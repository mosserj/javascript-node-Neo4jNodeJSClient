var _ = require('lodash');

function Domain(_node) {
  _.extend(this, _node.properties);

  if (this.name) {
    this.name = this.name;
  }
  if (this.duration) {
    this.duration = this.duration.toNumber();
  }
}

module.exports = Domain;
