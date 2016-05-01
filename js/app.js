(function() {
  'use strict';

  var isDebug = true,
    $search = document.getElementById('search'),
    $map = document.getElementById('map'),
    hasOwnProperty = Object.prototype.hasOwnProperty,
    i = 0,
    j = 0;

  // constant
  var APP_KEY = 'fendnm',
    FOURSQUARE_ACCESS_TOKEN = '51PLJOYW50B02CNWXRTQFJKRVHS1DUGJ1KENQROSEFVUU1GD',
    FOURSQUARE_VERSIONING = '20130815';

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

  function getTodayDate() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    return today;
  }

  function getTomorrowDate() {
    var tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    tmr.setHours(0, 0, 0, 0);

    return tmr;
  }

  /**
   * [isEmpty description]
   *
   * @see http://stackoverflow.com/questions/4994201/is-object-empty
   * @see http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
   * 
   * @param  {[type]}  obj [description]
   * @return {Boolean}     [description]
   */
  function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
  }

 
  /*================================================================ MODEL
  */

  var Location = function(loc) {
    this.id = loc.id,
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

    this.currentLocation = {};

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

    // sort by name
    // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    this.sortInitialLocationsByName = function() {
      initialLocations.sort(this.locationCompare);
    };
    this.sortInitialLocationsByName();

    var nInitialLocations = initialLocations.length;
    for (i = 0; i < nInitialLocations; i++) {
      var location = new Location(initialLocations[i]);

      self.locations.push(location);
    }

    // filtered location
    this.filteredLocations = ko.computed(function() {
      var search = self.search().toLowerCase();

      if (search) {
        var results = [];
        var locations = self.locations();
        var nLocations = locations.length;

        // alternative
        // ko.utils.arrayFilter
        for (i = 0; i < nLocations; i++) {
          var locationName = locations[i].name.toLowerCase();

          if (isStringContains(locationName, search)) {
            results.push(locations[i]);
          }
        }

        return results;
      }

      return self.locations();
    });

    // subscribe will run after
    // it's filtered
    this.filteredLocations.subscribe(function() {
      // reset currentLocation
      if (!isEmpty(self.currentLocation)) {
        var $currentLoc = document.getElementById(self.currentLocation.id);
        $currentLoc.classList.remove('active');
        self.currentLocation = {};
      }

      self.removeAllMarkers();
      self.addMarkers(self.filteredLocations());
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

        if (!isEmpty(self.currentLocation)) {
          var $previousLoc = document.getElementById(self.currentLocation.id);
          $previousLoc.classList.remove('active');
        }

        // set current location
        self.currentLocation = loc;
        var $currentLoc = document.getElementById(self.currentLocation.id);
        $currentLoc.classList.add('active');

        // popup info window
        self.setInfoWindowHtml(loc);
        self.infoWindow.open(self.map, marker);

        // fetch foursquare
        self.fetchSushi(loc);
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
      var nMarkers = self.markers.length;

      for (i = 0; i < nMarkers; i++) {
        self.markers[i].setMap(null);
      }

      self.markers = [];
    };

    this.getFilteredLocationIndexById = function(id) {
      var locations = self.filteredLocations();
      var nLocations = locations.length;

      for (i = 0; i < nLocations; i++) {
        if (id === locations[i].id) {
          return i;
        }
      }

      return 0;
    };

    this.popupLocation = function(loc) {
      var idx = self.getFilteredLocationIndexById(loc.id);
      var marker = self.markers[idx];

      // animate marker
      self.stopAllMarkerAnimations();
      self.startMarkerAnimation(marker);

      if (!isEmpty(self.currentLocation)) {
        var $previousLoc = document.getElementById(self.currentLocation.id);
        $previousLoc.classList.remove('active');
      }

      // set current location
      self.currentLocation = loc;
      var $currentLoc = document.getElementById(self.currentLocation.id);
      $currentLoc.classList.add('active');
      
      // force popup info window
      self.setInfoWindowHtml(loc);
      self.infoWindow.open(self.map, marker);

      // fetch foursquare
      self.fetchSushi(loc);
    };

    this.getSushiKey = function(loc) {
      return {
        'data': APP_KEY + loc.id,
        'ts': APP_KEY + loc.id + 'ts'
      };
    };

    this.fetchSushi = function(loc) {
      console.log('fetchSushi');
      var key = self.getSushiKey(loc);

      localforage.getItem(key.ts, function(err, value) {
        var recordedDate = value;
        var todayDate = getTodayDate().getTime();

        console.log(recordedDate);
        console.log(todayDate);

        // not more than 1 day
        // then using local data
        if (recordedDate > todayDate) {
          console.log('fetchSushi - using local data')
          localforage.getItem(key.data, function(err, value) {
            self.markSushi(value);
          });

        // older than 1 day
        // fetch a new data
        } else {
          console.log('fetchSushi - fetch new data');
          self.fetchFoursquare(loc, 'sushi');
        }
      });
    };

    this.fetchFoursquare = function(loc, query) {
      console.log('fetchFoursquare');

      var requestUrl = 'https://api.foursquare.com/v2/venues/search?oauth_token=%TOKEN%&v=%VERSIONING%&ll=%LAT%,%LNG%&query=%QUERY%';
      requestUrl = requestUrl.replace('%TOKEN%', FOURSQUARE_ACCESS_TOKEN);
      requestUrl = requestUrl.replace('%VERSIONING%', FOURSQUARE_VERSIONING);
      requestUrl = requestUrl.replace('%LAT%', loc.lat);
      requestUrl = requestUrl.replace('%LNG%', loc.lng);
      requestUrl = requestUrl.replace('%QUERY%', query);

      self.fetchUrl(loc, requestUrl);
    };

    // http://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery
    this.fetchUrl = function(loc, url) {
      console.log('fetchUrl');
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        console.log('fetchUrl - onload');

        // success
        if (request.status >= 200 && request.status < 400) {
          console.log('fetchUrl - onload - success', request);

          self.saveSushi(loc, request.responseText);
          self.markSushi(request.responseText);

        } else {
          // We reached our target server, but it returned an error
          console.log('fetchUrl - onload', request);
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        console.log('fetchUrl - onerror');
      };

      request.send();
    };

    this.markSushi = function(res) {
      console.log('markSushi');
      var maxN = 10,
        html = '',
        res = JSON.parse(res),
        meta = res.meta,
        items = res.response.venues;

      for (i = 0; i < maxN; i++) {
        var shop = items[i],
          shopName = shop.name,
          shopPhone = shop.contact.formattedPhone,
          shopAddress = shop.location.formattedAddress,
          shopLat = shop.location.lat,
          shopLng = shop.location.lng;

        html += '<p>';
        html += 'name: ' + shopName + '<br>';
        html += 'phone: ' + shopPhone + '<br>';
        html += 'address: ' + shopAddress + '<br>';
        html += 'lat: ' + shopLat + '<br>';
        html += 'lng: ' + shopLng;
      }

      console.log(html);
    };

    this.saveSushi = function(loc, responseText) {
      console.log('saveSushi');
      var key = self.getSushiKey(loc);

      localforage.setItem(key.data, responseText, function() {
        console.log('saveSushi - data', key.data, responseText);
      });

      var tmr = getTomorrowDate();
      var tmrTime = tmr.getTime();
      localforage.setItem(key.ts, tmrTime, function() {
        console.log('saveSushi - tsdata', key.ts, tmrTime);
      });
    };

    this.addMarkers(this.filteredLocations());
    
    google.maps.event.addListener(this.map, 'click', function(ev) {
      // nothing
    });
  };

  ko.applyBindings(new ViewModel());
})();
