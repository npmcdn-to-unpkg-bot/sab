(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabReservatorioHistorico', sabReservatorioHistorico);

    sabReservatorioHistorico.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabReservatorioHistorico($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          monitoramento: '=',
          slider: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 30, right: 20, bottom: 30, left: 50},
                width = 500 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse,
                bisectDate = d3.bisector(function(d) { return d.date; }).left;

            var formatTime = d3.time.format("%d/%m/%Y");

            var customTimeFormat = d3.time.format.multi([
              ["%m", function(d) { return d.getMonth(); }],
              ["%Y", function() { return true; }]
            ]);

            // Set the ranges
            var x = d3.time.scale().range([0, width]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the axes

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(2);

            // Define the line
            var valueline = d3.svg.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.close); });

            // Define the div for the tooltip
            var div = d3.select(element[0]).append("div")
                .attr("class", "time-graph-tooltip")
                .style("display", "none");

            // Adds the svg canvas
            var svg = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%',
                  'class': 'time-graph'})
                .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

            var lineSvg = svg.append("g")
              .append("path")
              .attr("class", "time-graph-path line");
            var xAxisSvg = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");
            var yAxisSvg = svg.append("g")
                .attr("class", "y axis");
            var line100PercSVG = svg.append("line")
              .attr("class", "time-graph-path limit-line");
            var focus = svg.append("g")
                .style("display", "none");
            focus.append("circle")
                .attr("class", "time-graph-dot y")
                .attr("r", 4);
            var rectMouse = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all");

            scope.$watch(function(scope) { return scope.monitoramento }, function(newValue, oldValue) {
              if (typeof newValue != 'undefined') {
                draw(newValue);
              }
            });

            scope.$watch(function(scope) { return scope.slider.maxValue }, function(newValue, oldValue) {
              var monitoramentoOriginal = scope.monitoramento;
              var monitoramentoNovo = [];
              if (typeof monitoramentoOriginal != 'undefined') {
                monitoramentoOriginal.forEach(function(d) {
                  if (newValue >= parseDate(d.DataInformacao).getFullYear() && scope.slider.minValue <= parseDate(d.DataInformacao).getFullYear()){
                    monitoramentoNovo.push(d);
                  }

                });
                draw(monitoramentoNovo);
              }
            });

            scope.$watch(function(scope) { return scope.slider.minValue }, function(newValue, oldValue) {
              var monitoramentoOriginal = scope.monitoramento;
              var monitoramentoNovo = [];
              if (typeof monitoramentoOriginal != 'undefined') {
                monitoramentoOriginal.forEach(function(d) {
                  if (newValue <= parseDate(d.DataInformacao).getFullYear() && scope.slider.maxValue >= parseDate(d.DataInformacao).getFullYear()){
                    monitoramentoNovo.push(d);
                  }
                });
                draw(monitoramentoNovo);
              }
            });

            // Get the data
            var draw = function(data) {

              data.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.close = +d.VolumePercentual;
              });
              data.sort(function(a, b) {
                  return a.date - b.date;
              });

              // Scale the range of the data
              var max = d3.max(data, function(d) { return d.close; });
              if (max < 100) { max = 100;}
              var extent = d3.extent(data, function(d) { return d.date; });
              var months = diffMouths(extent);

              x.domain(extent);
              y.domain([0, max]);

              var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(getTimeScaleTicksUnit(months), getTimeScaleTicksInterval(months))
                .tickFormat(customTimeFormat);

              // Add the valueline path.
              lineSvg.attr("d", valueline(data));
              // Add the X Axis
              xAxisSvg.call(xAxis);
              // Add the Y Axis
              yAxisSvg.call(yAxis);
              // Add 100% line
              line100PercSVG.attr({"x1": 0, "y1": y(100), "x2": width, "y2": y(100)});

              // append the rectangle to capture mouse
              rectMouse
                  .on("mouseover", function() { focus.style("display", null); })
                  .on("mouseout", mouseout)
                  .on("mousemove", mousemove);

              function mousemove() {
            		var x0 = x.invert(d3.mouse(this)[0]),
            		    i = bisectDate(data, x0, 1),
            		    d0 = data[i - 1],
            		    d1 = data[i],
            		    d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            		focus.select("circle.y")
            		    .attr("transform",
            		          "translate(" + x(d.date) + "," +
            		                         y(d.close) + ")");

                        div.style("display", "block");

                        var volume = Number(d.Volume.replace(",", "."));
                        div .html(Number((d.close).toFixed(2)) + "%" + "<br/>"  + Number((volume).toFixed(2)) + "hm³" + "<br/>" + formatTime(d.date))
                            .style("left", (x(d.date) + 80) + "px")
                            .style("top", (y(d.close) + 160) + "px");
            	}

              function mouseout() {
                focus.style("display", "none");
                div.style("display", "none");
              }

            function diffMouths(extent) {
              var months;
                  months = (extent[1].getFullYear() - extent[0].getFullYear()) * 12;
                  months -= extent[0].getMonth() + 1;
                  months += extent[1].getMonth();
              return months <= 0 ? 0 : months;
            }

            function getTimeScaleTicksUnit(mouths) {
              if (months < 24) {
                // Para menos de 2 anos, exibe todos os meses
                return d3.time.month;
              } else {
                // Para mais de 10 anos, exibe a cada 2 anos
                return d3.time.year;
              };
            }

            function getTimeScaleTicksInterval(mouths) {
              if (months < 24) {
                // Para menos de 2 anos, exibe todos os meses
                return 1;
              } else if (months >= 24 && months < 120) {
                // Para ate 10 anos, exibe anualmente
                return 1;
              } else {
                // Para mais de 10 anos, exibe a cada 2 anos
                return 2;
              };
            }

          }
        }
      }
    }
})();
