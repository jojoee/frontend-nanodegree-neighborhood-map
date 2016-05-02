# Frontend Nanodegree Neighborhood Map
Neighborhood Map project for [Front-End Web Developer Nanodegre](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001), and this is [Project Rubric](https://review.udacity.com/#!/projects/2711658591/rubric)

## Getting Started
Open index.html file in your browser or review online [here](http://jojoee.github.io/frontend-nanodegree-neighborhood-map/)

## Setup task runner for devloper
1. Go to project's root directory
2. Install [npm](http://blog.npmjs.org/post/85484771375/how-to-install-npm)
2. Install [gulp.js](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
3. Run `npm install` for install all dependencies
4. Run `gulp` for start task runner

## Note
- Indent: 2 spaces
- Code style: [Airbnb JavaScript Style Guide() {](https://github.com/airbnb/javascript) and [Udacity JavaScript Style Guide](http://udacity.github.io/frontend-nanodegree-styleguide/javascript.html)

## TODO
- [x] Using Knockout framework in a proper way
- [x] Responsive and usable for all devices (modern desktop, tablet, and phone browsers)
- [x] Map by Google map API with Map-marker
- [x] Display locations by default when the page is loaded (at least 5 locations)
- [x] Implement a list view of locations and it can be filtered (the list view and the markers should update accordingly)
- [x] Location list and Map-marker are clickable, when we click it ten animate the marker (e.g. bouncing, color change) and popup the `infoWindow` with unique information about the location.
- [x] All data requests are retrieved in an asynchronous manner
- [x] Implement [Foursquare API](https://developer.foursquare.com/start)
- [ ] Implement [Yelp API](https://www.yelp.com/developers/documentation/v2/overview)
- [ ] Implement [Wikipedia](https://www.mediawiki.org/wiki/API:Main_page)
- [ ] Implement [Instagram](https://www.instagram.com/developer/)
- [x] Error Free
- [x] Tell the user (e.g. text or popup) when we can not connect 3rd-party or get error from it
- [x] Update README file
- [x] Add comments
- [x] Implement [SweetAlert2](http://limonte.github.io/sweetalert2/)
- [ ] Implement template engine
- [x] Implement [pace](http://github.hubspot.com/pace/docs/welcome/)
- [x] Update Google map style by [Midnight Commander](https://snazzymaps.com/style/2/midnight-commander)
- [ ] Add `JSHint` into task runner
- [ ] Refactor
- [ ] Implement query string builder [1](http://stackoverflow.com/questions/316781/how-to-build-query-string-with-javascript), [2](http://stackoverflow.com/questions/111529/create-query-parameters-in-javascript), [3](http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object)
- [ ] Add unique functionality beyond the minimum requirements (i.e. the ability to "favorite" a location, etc)
- [ ] Incorporate a build process allowing for production quality, minified code, to be delivered to the client
- [x] Data persists when the app is closed and reopened, either through localStorage (1 day cached) (e.g. [localForage](https://mozilla.github.io/localForage/)) or an external database (e.g. Firebase)
- [ ] Style different markers in different (and functionally-useful) ways, depending on the data set
- [ ] Implement additional optimizations that improve the performance and user experience of the filter functionality (keyboard shortcuts, autocomplete functionality, filtering of multiple fields, etc)
- [ ] Integrate all application components into a cohesive and enjoyable user experience

## Reference and other
- [todomvc by knockoutjs](http://todomvc.com/examples/knockoutjs/)
- [snazzymaps.com](snazzymaps.com)
- Knockoutjs tut - [1](http://jsfiddle.net/rniemeyer/LkqTU/), [2](http://learn.knockoutjs.com/), [3](http://knockoutjs.com/documentation/introduction.html)
- [Google map](https://developers.google.com/maps/documentation/javascript/reference)
- Google map event - [Simple click event](https://developers.google.com/maps/documentation/javascript/examples/event-simple)
- [Google map marker](https://developers.google.com/maps/documentation/javascript/markers) - [Custom Markers](https://developers.google.com/maps/tutorials/customizing/custom-markers), [Marker Animations](https://developers.google.com/maps/documentation/javascript/examples/marker-animations), [Simple markers](https://developers.google.com/maps/documentation/javascript/examples/marker-simple), [Remove Markers](https://developers.google.com/maps/documentation/javascript/examples/marker-remove)
- [Google map info windows](https://developers.google.com/maps/documentation/javascript/infowindows)- [Info window](https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple)
