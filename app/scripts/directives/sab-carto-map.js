(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabCartoMap', sabCartoMap);

    sabCartoMap.$inject = ['$window','RESTAPI'];

    /*jshint latedef: nofunc */
    function sabCartoMap($window, RESTAPI) {
      return {
        template: '',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          var mapOptions = {
            shareable: (attrs.shareable) ? scope.$eval(attrs.shareable) : false,              //shareable
            title: (attrs.title) ? scope.$eval(attrs.title) : false,                          //title
            description: (attrs.description) ? scope.$eval(attrs.description) : false,        //description
            searchControl: (attrs.searchControl) ? scope.$eval(attrs.searchControl) : false,  //search-control
            zoomControl: (attrs.zoomControl) ? scope.$eval(attrs.zoomControl) : true,         //zoom-control
            loaderControl: (attrs.loaderControl) ? scope.$eval(attrs.loaderControl) : true,   //loader-control
            center_lat: (attrs.centerLat) ? scope.$eval(attrs.centerLat) : -10.240929,        //center-lat
            center_lon: (attrs.centerLon) ? scope.$eval(attrs.centerLon) : -44.231820,        //center-lon
            zoom: (attrs.zoom) ? scope.$eval(attrs.zoom) : 6,                                 //zoom
            cartodb_logo: (attrs.cartodbLogo) ? scope.$eval(attrs.cartodbLogo) : true,        //cartodb-logo
            infowindow: (attrs.infowindow) ? scope.$eval(attrs.infowindow) : true,            //attrs.infowindow
            layer_selector: (attrs.layerSelector) ? scope.$eval(attrs.layerSelector) : false, //layer-selector
            legends: (attrs.legends) ? scope.$eval(attrs.legends) : true,                     //legends
            https: (attrs.https) ? scope.$eval(attrs.https):  false,                          //https
            scrollWheel: (attrs.scrollWheel) ? scope.$eval(attrs.scrollWheel): true,          //scroll-wheel
            fullscreen: (attrs.fullscreen) ? scope.$eval(attrs.fullscreen) : false            //fullscreen
          };
          cartodb.createVis(element[0].id,
            'https://jeffersonrpn.carto.com/api/v2/viz/50ffaf48-739d-11e6-ba38-0ee66e2c9693/viz.json',
            mapOptions)
            .done(function(vis, layers) {
              var map = vis.getNativeMap();
              // Atribui as variaveis do mapa ao $scope
              scope.$apply(function() {
                scope.vis = vis;
                scope.map = map;
                scope.basemap = layers[0];
                scope.mapLayers = layers[1];
              });
            })
            .error(function(err) {
              console.log(err);
            });
        }
      }
    }
})();
