function jeocrowdSearch(keywords, flickr_page_number) {
  loading_starting_timepoint = new Date();   
  flickr_api_url = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=656222a441d1f6305791eeee478796d0&text="+
  keywords+
  "&has_geo=true" +
  "&extras=geo" +
  "&page="+flickr_page_number+
  "&sort=date-taken-desc&format=json&outlier=?";
  
  
  /************** TESTING MODE **************/
  // $.getJSON('flickr_data_demo.json', function(data) {
  //   jsonFlickrApi(data);
  // });
  // console.log("On TESTING MODE");
  // return true;
  /*********** END OF TESTING MODE **********/
  
  
  $.getJSON(flickr_api_url);
  console.log(flickr_api_url);
  return true;
}


function addMarkerinArray(point, markersArray, size) {
  latlng = new google.maps.LatLng(point.latitude, point.longitude);
  var marker_image = 'images/marker_'+size+'.png';
  marker = new google.maps.Marker({
    position: latlng, 
    title: "Degree = "+point.degree+"",
    icon: marker_image
  });
  markersArray.push(marker);
}


function distance(p1, p2) {
   var R = 6371; // earth's mean radius in km
   var dLat  = rad(p2.latitude - p1.latitude);
   var dLong = rad(p2.longitude - p1.longitude);

   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) * Math.sin(dLong/2) * Math.sin(dLong/2);
   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   var d = R * c;
   return (d*1000);
}

function find_central_latlng() {
  // average central point LAT - LNG
  central_lat_sum = 0.0;
  central_lng_sum = 0.0;
  for (var k=0; k < points_clean.length; k++) {
    central_lat_sum += points_clean[k].latitude;
    central_lng_sum += points_clean[k].longitude;
  };
  central_lng = central_lng_sum/points_clean.length;
  central_lat = central_lat_sum/points_clean.length;
  if (!central_lat || !central_lng) {
    return false;
  } else {
    central_latlng = new google.maps.LatLng(central_lat, central_lng);
    return central_latlng;
  }
}

function assignDegreeToPoints() {
  for(i=0; i < points.length; i++) {
    current_point = points[i];
    for(k = i; k < points.length; k++) {
      next_point = points[k];
      dist = distance(current_point, next_point);
      if (dist < MAX_D && dist > 0) {
        
        if (current_point.degree) {
          current_point.degree+=1;
        } else {
          current_point.degree=1;
        }

        if (next_point.degree) {
          next_point.degree+=1;
        } else {
          next_point.degree=1;
        }
      } // end if distance < MAX DISTANCE
    } // end k loop
  } // end i loop
}

function displayMarkersArray(markersArray) {
  for (i in markersArray) {
    markersArray[i].setMap(map);
    infowindow = new google.maps.InfoWindow({
        content: markersArray[i].getTitle()
    });
    google.maps.event.addListener(markersArray[i], 'click', function() {
      infowindow.open(map,markersArray[i]);
    });
  }
}

function averageFromCenter () {
  center_point = {
    latitude  : central_latlng.lat(), 
    longitude : central_latlng.lng()
  };
  sum_from_center = 0;
  for(i=0; i < points_clean.length; i++) {
    sum_from_center += distance(points_clean[i], center_point); 
  }
  average_from_center = sum_from_center / points_clean.length;
  console.log("average from center = ", average_from_center);
}

function hideMarkersArray(markersArray) {
  for (i in markersArray) {
    markersArray[i].setMap(null);
  }
}

function jsonFlickrApi(data) {
  loading_finishing_timepoint = new Date();    
  cpu_starting_timepoint = new Date();
  $('div.loading_wrapper').fadeOut();

  flickr_data = data;
  points = data.photos.photo;
  points_clean = [];
  flickr_num_of_pages = data.photos.pages - 1;
  flickr_current_page_number = data.photos.page;

  
  /****************************************************/
  /*    OUTLIER DETECTION ALGORITHM on var points     */ 
  /****************************************************/      
  assignDegreeToPoints();
  for(i=0; i < points.length; i++) {
    if ((points[i].degree+"") != ""  && points[i].degree > MIN_D ) {
      // apply X, Y to point objects to comply with the convex_hull library
      points[i].x = points[i].longitude;
      points[i].y = points[i].latitude;
      
      points_clean.push(points[i]);
      // creating the markers array for the map
      addMarkerinArray(points[i], points_markers_array, 'medium_black');
      addMarkerinArray(points[i], points_clean_markers_array, 'medium_red');
    } else {
      addMarkerinArray(points[i], points_markers_array, 'medium_black');
    }
  }    
  
  
  central_latlng = find_central_latlng();
  average_from_center = averageFromCenter();
  calculateConvexHull(points_clean, "#f00");
  
  
  // CENTER MAP
  if (!central_latlng) {
    map.setCenter(new google.maps.LatLng(32.32, 32.32));
    map.setZoom(2);
  } else {
    map.setCenter(central_latlng);
  }
  
  
  // area = calculateConvexHull(points_clean, "red");
  
  // point_vs_area_to_display = point_vs_area_to_display();
  
  // PRINTING THE CENTRAL MARKER
  central_marker = new google.maps.Marker({position: central_latlng, title: "Center of CLUSTER", icon: 'images/marker_extra_large_black.png', map: map});
  
  cpu_finishing_timepoint = new Date();
  cpu_elapsed_time = (cpu_finishing_timepoint - cpu_starting_timepoint);
  loading_elapsed_time = (loading_finishing_timepoint - loading_starting_timepoint);
  $('#points_clean_length').text(points_clean_markers_array.length);
  $('#points_length').text(points_markers_array.length);
  $("span#flickr_current_page_number").text(flickr_current_page_number);
  $("span#flickr_num_of_pages").text(flickr_num_of_pages);
  $("span#cpu_time").text(cpu_elapsed_time+" ms");
  $("span#loading_time").text(loading_elapsed_time+" ms");
  
  if (flickr_current_page_number+1 > flickr_num_of_pages) {
    $("a#jeocrowd_search_next_page").hide();
  } else {
    $("a#jeocrowd_search_next_page").attr("href", "javascript:jeocrowdSearch(\""+keywords+"\", "+(flickr_current_page_number+1)+")");
  }
  
  return true;
} // end function jsonFlickrApi


function point_vs_area_to_display() {
   has_many_subclusters = ((sq_1 / average_from_center_2) < 3 && (sq_1 / average_from_center_2) > 0.3 ) && total_flickr_data > 100;
   if (has_many_subclusters) {
      map.clearOverlays();
      hide_all_polygons();
      return point_vs_area_to_display = "There seem to be many points of interest for this query";
   }
   if (sq_1 > 4000000 || average_from_center > 3000) {
      map.clearOverlays();
      hide_all_polygons();
      return point_vs_area_to_display = "Ooops. False result! Refine your search with more specific keywords.";
   } else {
      if (average_from_center > 100) {
         console.log("sq_1 / average_from_center_2 = "+ sq_1 / average_from_center_2);
         point_vs_area_to_display = "AREA";
         map.clearOverlays();
         hide_all_polygons();
         show_center_of_the_cluster();
         polygon_1.show();
         // polygon_3.show();
         return point_vs_area_to_display;
      } else {
         // point case
         point_vs_area_to_display = "POINT";
         map.clearOverlays();
         hide_all_polygons();
         show_center_of_the_cluster();
         // polygon_5.show();
         return point_vs_area_to_display;
      }
   }
}
