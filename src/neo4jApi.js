require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Domain = require('./models/Domain');
var IP = require('./models/IP');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "net_user"));

function searchDomains(queryString) {
  var session = driver.session();
  return session
    .run(
	"MATCH (i)-[r:hasIP]->(d) \
	WHERE lower(d.name) contains lower({name}) \
	RETURN d, i",
      {name: '' + queryString + ''}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Domain(record.get('d'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getDomain(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (domain:Domain {name: {title}})\
		OPTIONAL MATCH (domain)<-[r:hasIP]-(ip:IP) \
		RETURN domain.name AS title, collect([ip.ip]) AS IP \
		LIMIT 1", {title})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new IP(record.get('title'), record.get('IP'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    "MATCH (d)-[r:hasIP]->(i) RETURN d as Domain, collect(i) as IP")
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
	  //debugger;
      results.records.forEach(res => { 
        nodes.push({name: res.get('Domain'), label: 'Domain'});
        var target = i;
        i++;
		//debugger;
        res.get('IP').forEach(name => {
          var ipAddress = {name: name, label: 'IP'};
          var source = _.findIndex(nodes, ipAddress);
          if (source == -1) {
            nodes.push(ipAddress);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

exports.searchDomains = searchDomains;
exports.getDomain = getDomain;
exports.getGraph = getGraph;
