/* globals ko, google, initialLocations, mapStyle, sweetAlert, localforage */

'use strict';

// constant
var APP_KEY = 'fendnm',
  FOURSQUARE_ACCESS_TOKEN = '51PLJOYW50B02CNWXRTQFJKRVHS1DUGJ1KENQROSEFVUU1GD',
  FOURSQUARE_CLIENT_ID = '0TCYQ2BE4YEFBDE51SMCHXCMPVTRPYLOYE1XLF5IZOU5BB50',
  FOURSQUARE_VERSIONING = '20130815';

// globar variable
var $map = document.getElementById('map'),
  $shops = document.getElementsByClassName('shops')[0],
  hasOwnProperty = Object.prototype.hasOwnProperty,
  i = 0;

/*================================================================ UTIL
*/

/**
 * Check if string contain `needle`
 *
 * @see http://stackoverflow.com/questions/1789945/how-can-i-check-if-one-string-contains-another-substring
 * @see http://stackoverflow.com/questions/3480771/how-do-i-check-if-string-contains-substring
 * 
 * @param  {String}  str
 * @param  {String}  needle
 * @return {Boolean}
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
 * Check variable is empty or not
 *
 * @see http://stackoverflow.com/questions/4994201/is-object-empty
 * @see http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 * 
 * @param  {Object}  obj
 * @return {Boolean}
 */
function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj === null) return true;

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

// location object
var Location = function(loc) {
  this.id = loc.id;
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
  
  /**
   * Sort `Location` by name
   *
   * @see http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
   * 
   * @return {[type]} [description]
   */
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

  // subscribe will run after it's filtered
  this.filteredLocations.subscribe(function() {
    // clear $shops
    $shops.innerHTML = '';

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

  // set infor window content
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

  // stop animation of all markers
  this.stopAllMarkerAnimations = function() {
    var nMarker = self.markers.length;

    for (i = 0; i < nMarker; i++) {
      self.stopMarkerAnimation(self.markers[i]);
    }
  };

  // stop animation of specific marker
  this.stopMarkerAnimation = function(marker) {
    marker.setAnimation(null);
  };

  // start animation
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
      self.popupLocation(loc, marker);
    });
    
    self.markers.push(marker);
  };

  // add markers into the map
  this.addMarkers = function(locs) {
    var nLocs = locs.length;

    for (i = 0; i < nLocs; i++) {
      self.addMarker(locs[i]);
    }
  };

  // remove all markers
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

  // fire when user client on the list only
  this.setLocation = function(loc) {
    var idx = self.getFilteredLocationIndexById(loc.id);
    var marker = self.markers[idx];

    self.popupLocation(loc, marker);
  };

  this.popupLocation = function(loc, marker) {
    // animate marker
    self.stopAllMarkerAnimations();
    self.startMarkerAnimation(marker);

    // remove class from previous location item (on the list)
    if (!isEmpty(self.currentLocation)) {
      var $previousLoc = document.getElementById(self.currentLocation.id);
      $previousLoc.classList.remove('active');
    }

    // set current location
    self.currentLocation = loc;

    // add class into current location item (on the list)
    var $currentLoc = document.getElementById(self.currentLocation.id);
    $currentLoc.classList.add('active');
    
    // force popup info window
    self.setInfoWindowHtml(loc);
    self.infoWindow.open(self.map, marker);

    // fetch foursquare
    self.fetchSushi(loc);
  };

  // get sushi key for `localforage` plugin
  this.getSushiKey = function(loc) {
    return {
      'data': APP_KEY + loc.id,
      'ts': APP_KEY + loc.id + 'ts'
    };
  };

  // fetch sushi shop data
  this.fetchSushi = function(loc) {
    var key = self.getSushiKey(loc);

    // check date of recorded data
    localforage.getItem(key.ts, function(err, value) {
      var recordedDate = value;
      var todayDate = getTodayDate().getTime();

      // not more than 1 day
      // then using local data
      if (recordedDate > todayDate) {
        localforage.getItem(key.data, function(err, value) {
          self.addSushiShopsFromResponse(value);
        });

      // older than 1 day
      // fetch a new data
      } else {
        self.fetchFoursquare('sushi');
      }
    });
  };

  // fetch data from `Foursquare`
  this.fetchFoursquare = function(query) {
    var requestUrl = 'https://api.foursquare.com/v2/venues/search?oauth_token=%TOKEN%&v=%VERSIONING%&ll=%LAT%,%LNG%&query=%QUERY%';
    requestUrl = requestUrl.replace('%TOKEN%', FOURSQUARE_ACCESS_TOKEN);
    requestUrl = requestUrl.replace('%VERSIONING%', FOURSQUARE_VERSIONING);
    requestUrl = requestUrl.replace('%LAT%', self.currentLocation.lat);
    requestUrl = requestUrl.replace('%LNG%', self.currentLocation.lng);
    requestUrl = requestUrl.replace('%QUERY%', query);

    self.fetchUrl(requestUrl);
  };

  /**
   * Fetch data from URL
   *
   * @see http://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery
   * 
   * @param  {String}   url
   */
  this.fetchUrl = function(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      // success
      if (request.status >= 200 && request.status < 400) {
        self.saveSushi(self.currentLocation, request.responseText);
        self.addSushiShopsFromResponse(request.responseText);

      } else {
        // We reached our target server, but it returned an error
        sweetAlert(
          'Oops...',
          'Something went wrong!',
          'error'
        );
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      sweetAlert(
        'Oops...',
        'Something went wrong!',
        'error'
      );
    };

    request.send();
  };

  this.getSushiShopUrl = function(shopId) {
    var shopUrl = 'https://foursquare.com/v/%SHOP_ID%?ref=%CLIENT_ID%';
    shopUrl = shopUrl.replace('%SHOP_ID%', shopId);
    shopUrl = shopUrl.replace('%CLIENT_ID%', FOURSQUARE_CLIENT_ID);

    return shopUrl;
  };

  // add sushi shop into DOM
  this.addSushiShopsFromResponse = function(res) {
    var maxN = 10,
      items = JSON.parse(res).response.venues;

    // clear $shops
    $shops.innerHTML = '';
    for (i = 0; i < maxN; i++) {
      var $shop = document.createElement('a'),
        shop = items[i],
        shopId = shop.id,
        shopName = shop.name,
        shopPhone = shop.contact.formattedPhone,
        shopAddress = shop.location.formattedAddress;

      $shop.classList.add('shop');
      var shopUrl = self.getSushiShopUrl(shopId);
      $shop.setAttribute('href', shopUrl);
      $shop.setAttribute('target', '_blank');
      $shop.setAttribute('rel', 'nofollow');
      $shop.setAttribute('data-shop-id', shopId);

      $shop.appendChild(document.createTextNode('name: ' + shopName));
      $shop.appendChild(document.createElement('br'));
      if (shopPhone) {
        $shop.appendChild(document.createTextNode('phone: ' + shopPhone));
        $shop.appendChild(document.createElement('br'));
      }
      if (shopAddress) {
        $shop.appendChild(document.createTextNode('address: ' + shopAddress));
        $shop.appendChild(document.createElement('br'));
      }

      // append into $shops
      $shops.appendChild($shop);
    }
  };

  // save sushi data into `localforage`
  this.saveSushi = function(loc, responseText) {
    var key = self.getSushiKey(loc);

    localforage.setItem(key.data, responseText, function() {
      // nothing
    });

    var tmr = getTomorrowDate();
    var tmrTime = tmr.getTime();
    localforage.setItem(key.ts, tmrTime, function() {
      // nothing
    });
  };

  // add initial marker into map
  this.addMarkers(this.filteredLocations());
  
  google.maps.event.addListener(this.map, 'click', function(ev) {
    // nothing
  });
};

function initApp() {
  ko.applyBindings(new ViewModel());
}
