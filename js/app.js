(function() {
  'use strict';

  var $search = document.getElementById('search'),
    $map = document.getElementById('map');

  var i = 0,
    j = 0;

  /*================================================================ UTIL
  */
  
  /**
   * [isStringContains description]
   *
   * @see http://stackoverflow.com/questions/1789945/how-can-i-check-if-one-string-contains-another-substring
   * @see http://stackoverflow.com/questions/3480771/how-do-i-check-if-string-contains-substring
   * 
   * @param  {[type]}  str    [description]
   * @param  {[type]}  needle [description]
   * @return {Boolean}        [description]
   */
  function isStringContains(str, needle) {
    return str.indexOf(needle) > -1;
  }

  function getAvgCoordinate(locs) {
    var nLocs = locs.length,
      avgCoord = {
        lat: 0,
        lng: 0
      };

    for (i = 0; i < nLocs; i++) {
      avgCoord.lat += locs[i].lat;
      avgCoord.lng += locs[i].lng;
    }

    avgCoord.lat /= nLocs;
    avgCoord.lng /= nLocs;

    return avgCoord;
  }
 
  /*================================================================ MODEL
  */

  var Location = function(loc) {
    this.name = loc.name;
    this.lat = loc.lat;
    this.lng = loc.lng;
    this.type = loc.type;
    this.desc = loc.desc;
  };

  /*================================================================ VIEW MODEL
  */

  var ViewModel = function() {
    var self = this;

    // search
    this.search = ko.observable('');

    // location
    this.locations = ko.observableArray([]);
    this.locationCompare = function(a,b) {
      if (a.name < b.name) {
        return -1;

      } else if (a.name > b.name) {
        return 1;

      } else {
        return 0;
      }
    };

    // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    this.sortInitialLocations = function() {
      initialLocations.sort(this.locationCompare);
    };
    this.sortInitialLocations();

    var nInitialLocations = initialLocations.length;
    for (i = 0; i < nInitialLocations; i++) {
      var location = new Location(initialLocations[i]);

      self.locations.push(location);
    }

    // filtered location
    this.filteredLocations = ko.computed(function() {
      var search = self.search().toLowerCase();

      if (search) {
        return ko.utils.arrayFilter(self.locations(), function(loc) {
          var locationName = loc.name.toLowerCase()

          return isStringContains(locationName, search);
        });

      } else {
        return self.locations();
      }
    });

    // map
    var avgCoord = getAvgCoordinate(initialLocations);
    var mapArgs = {
      center: {
        lat: avgCoord.lat,
        lng: avgCoord.lng
      },
      zoom: 16,
      scrollwheel: false,
      zoomControl: false,
      scaleControl: false,
      disableDoubleClickZoom: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: mapStyle
    };
    this.map = new google.maps.Map($map, mapArgs);

    // info window
    this.infoWindow = new google.maps.InfoWindow({
      content: '',
      maxWidth: 320
    });

    this.setInfoWindowHtml = function(loc) {
      var html = '<div class="info-content">';
        html += '<h3>' + loc.name + '</h3>';
        html += '<p>type: ' + loc.type + '</p>';
        html += '<p>' + loc.desc + '</p>';
        html += '</div>';

      self.infoWindow.setContent(html);
    };

    // marker
    this.markers = [];

    this.stopAllMarkerAnimations = function() {
      var nMarker = self.markers.length;

      for (i = 0; i < nMarker; i++) {
        self.stopMarkerAnimation(self.markers[i]);
      }
    };

    this.stopMarkerAnimation = function(marker) {
      marker.setAnimation(null);
    };

    this.startMarkerAnimation = function(marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    };

    // add marker into the map
    this.addMarker = function(loc) {
      var marker = new google.maps.Marker({
        title: loc.name,
        position: loc,
        draggable: false,
        animation: google.maps.Animation.DROP,
        map: self.map
      });
      marker.addListener('click', function() {
        // animate marker
        self.stopAllMarkerAnimations();
        self.startMarkerAnimation(marker);

        // popup info window
        self.setInfoWindowHtml(loc);
        self.infoWindow.open(self.map, marker);
      });
      
      self.markers.push(marker);
    };

    this.addMarkers = function(locs) {
      var nLocs = locs.length;

      for (i = 0; i < nLocs; i++) {
        self.addMarker(locs[i]);
      }
    };

    this.removeAllMarkers = function() {
      var nLocs = locs.length;

      for (i = 0; i < nLocs; i++) {
        self.markers[i].setMap(null);
      }

      self.markers = [];
    }

    this.addMarkers(this.filteredLocations());
    
    google.maps.event.addListener(this.map, 'click', function(ev) {
      // nothing
    });
  };

  ko.applyBindings(new ViewModel());
})();
