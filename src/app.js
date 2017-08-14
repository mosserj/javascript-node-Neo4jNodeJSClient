var api = require('./neo4jApi');

$(function () {
  renderGraph();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
  
    $("#addDomain").submit(e => {
    e.preventDefault();
    addDomain();
  });
  
    $("#clearDatabase").submit(e => {
    e.preventDefault();
    clearDatabase();
  });
  
	$("#createDomainsALOTOFTHEM").submit(e => {
    e.preventDefault();
    createDomainsALOTOFTHEM();
  });
  
  
});

function showDomain(title) {
  api
    .getDomain(title)
    .then(domain => {
      if (!domain) return;

      $("#title").text(domain.title);
     var $list = $("#ipId").empty();
      domain.ipAddress.forEach(ip => {
        $list.append($("<li>" + ip.name + "</li>"));
      });
    }, "json");
}

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchDomains(query)
    .then(domains => {
      var t = $("table#results tbody").empty();

      if (domains) {
		  //Distinct on domains
        uniqueBy(domains, function(x){return x.name;}).forEach(domain => {
          $("<tr><td class='domain'>" + domain + "</td></tr>").appendTo(t)
            .click(function() {
              showDomain($(this).find("td.domain").text());
            })
        });

        var first = domains[0];
        if (first) {
          showDomain(first.name);
        }
      }
    });
}

function uniqueBy(arr, fn) {
  var unique = {};
  var distinct = [];
  arr.forEach(function (x) {
    var key = fn(x);
    if (!unique[key]) {
      distinct.push(key);
      unique[key] = true;
    }
  });
  return distinct;
}

function clearDatabase() {
	  	$.ajax({
	  method: "GET",
	  url: "http://localhost/api/v1/domain/clear/",
	  contentType: "application/json; charset=utf-8",
      dataType: "json",
        success: function(data){alert("DB successfully cleared"); renderGraph(); search();},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
		 alert(XMLHttpRequest.responseText);
	  }
	});
}

function createDomainsALOTOFTHEM() {
	  	$.ajax({
	  method: "GET",
	  url: "http://localhost/api/v1/domain/create/",
	  contentType: "application/json; charset=utf-8",
      dataType: "json",
        success: function(data){alert("Creating 100k items!"); renderGraph(); search();},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
		 alert(XMLHttpRequest.responseText);
	  }
	});
}

function addDomain() {
	//this uses swagger api in C#
	
  var domain = $("#addDomain").find("input[name=addDomain]").val();
  var ip = $("#addDomain").find("input[name=addIp]").val();

  	$.ajax({
	  method: "POST",
	  url: "http://localhost/api/v1/domain/add/",
	  data: JSON.stringify({ "IP": ip, "Name" : domain }),
	  contentType: "application/json; charset=utf-8",
      dataType: "json",
        success: function(data){alert("Domain successfully added"); renderGraph(); search();},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
     alert(XMLHttpRequest.responseText);
  }
	});
	
}

function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("domain")
        .text(d => {
          return d.domain;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
