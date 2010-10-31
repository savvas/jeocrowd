// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.
// http://geometryalgorithms.com/Archive/algorithm_0109/algorithm_0109.htm
 
// Assume that a class is already given for the object:
//    Point with coordinates {float x, y;}
//===================================================================
 
 
// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line
//    See: the January 2001 Algorithm on Area of Triangles
function isLeft( P0, P1, P2 )
{
    return (P1.x - P0.x)*(P2.y - P0.y) - (P2.x - P0.x)*(P1.y - P0.y);
}
//===================================================================
 
 
// chainHull_2D(): Andrew's monotone chain 2D convex hull algorithm
//     Input:  P[] = an array of 2D points 
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]
function chainHull_2D( P, n, H )
{
    // the output array H[] will be used as the stack
    var    bot=0, top=(-1);  // indices for bottom and top of the stack
    var    i;                // array scan index
 
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0, minmax;
    var xmin = P[0].x;
    for (i=1; i<n; i++)
        if (P[i].x != xmin) break;
    minmax = i-1;
    if (minmax == n-1) {       // degenerate case: all x-coords == xmin
        H[++top] = P[minmin];
        if (P[minmax].y != P[minmin].y) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin];           // add polygon endpoint
        return top+1;
    }
 
    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n-1;
    var xmax = P[n-1].x;
    for (i=n-2; i>=0; i--)
        if (P[i].x != xmax) break;
    maxmin = i+1;
 
    // Compute the lower hull on the stack H
    H[++top] = P[minmin];      // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin)
    {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft( P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
            continue;          // ignore P[i] above or on the lower line
 
        while (top > 0)        // there are at least 2 points on the stack
        {
            // test if P[i] is left of the line at the stack top
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         // P[i] is a new hull vertex
            else
                top--;         // pop top point off stack
        }
        H[++top] = P[i];       // push P[i] onto stack
    }
 
    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin)      // if distinct xmax points
        H[++top] = P[maxmax];  // push maxmax point onto stack
    bot = top;                 // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax)
    {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft( P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
            continue;          // ignore P[i] below or on the upper line
 
        while (top > bot)    // at least 2 points on the upper stack
        {
            // test if P[i] is left of the line at the stack top
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         // P[i] is a new hull vertex
            else
                top--;         // pop top point off stack
        }
        H[++top] = P[i];       // push P[i] onto stack
    }
    if (minmax != minmin)
        H[++top] = P[minmin];  // push joining endpoint onto stack
 
    return top+1;
}










   var polygon = null;
   var gmarkers = [];
   var hullPoints = [];
/*
points = [
new GLatLng(37.455949,-122.184578),
new GLatLng(37.426063,-122.112959),
new GLatLng(37.442271,-122.099669),
new GLatLng(37.462248,-122.160239),
new GLatLng(37.454942,-122.140154),
new GLatLng(37.434649,-122.151661),
new GLatLng(37.439245,-122.119776),
new GLatLng(37.441485,-122.163136),
new GLatLng(37.450725,-122.119423),
new GLatLng(37.457801,-122.117583)
]
*/
 
 
 
  function calculateConvexHull(hull_points, color) {
     polygon = null;
     gmarkers = [];
     hullPoints = [];
      // document.getElementById("hull_points").innerHTML = "";
      hull_points.sort(sortPointY);
      hull_points.sort(sortPointX);
      polygon  = DrawHull(hull_points, color);
      return polygon;
   }
 
  function sortPointX(a,b) { return a.x - b.x; }
  function sortPointY(a,b) { return a.y - b.y; }

  function DrawHull(cur_points, color) {
     console.log("We start calculating the convex hull for: "+cur_points.length+" points");
     foo = chainHull_2D(cur_points, cur_points.length, hullPoints );
     console.log("foo-"+foo);
     polygon_path = [];
     for (var k=0; k < hullPoints.length; k++) {
       polygon_path.push(new google.maps.LatLng(hullPoints[k].y, hullPoints[k].x));
     }
     
     polygon = new google.maps.Polygon({
         paths: polygon_path,
         strokeColor: "#000",
         strokeOpacity: 0.1,
         strokeWeight: 2,
         fillColor: color,
         fillOpacity: 0.1
       });
     polygon.setMap(map);
     return polygon;
  }