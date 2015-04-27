var mapCode = function() {
   emit(this.state,
     { "data":
        [
            {
                "name": this.city,
                "lat":  this.loc[0],
                "lon":  this.loc[1]
            }
        ]
    });
}

var reduceCode = function(key, values) {

    var reduced = {"data":[]};
    for (var i in values) {
        var inter = values[i];
        for (var j in inter.data) {
            reduced.data.push(inter.data[j]);
        }
    }

    return reduced;
}
 
var finalize =  function (key, reduced) {

    if (reduced.data.length == 1) {
        return { "message" : "This Country contains only 1 City" };
    }

    var min_dist = 999999999999;
    var city1 = { "name": "" };
    var city2 = { "name": "" };

    var c1;
    var c2;
    var d;
    for (var i in reduced.data) {
        for (var j in reduced.data) {
            if (i>=j) continue;
            c1 = reduced.data[i];
            c2 = reduced.data[j];
            if(c1.name !=c2.name){
                d = Math.sqrt((c1.lat-c2.lat)*(c1.lat-c2.lat)+(c1.lon-c2.lon)*(c1.lon-c2.lon));
                if (d < min_dist && d > 0) {
                    min_dist = d;
                    city1 = c1;
                    city2 = c2;
                }
            }
        }
    }

    return {"city1": city1.name, "city2": city2.name, "dist": min_dist};
};
 
 db.zips.mapReduce(mapCode, reduceCode, 
   { query: {CountryID: { $ne: 254 }},
   out: "closest",
   finalize: finalize});
   
db.closest.find().forEach(printjson)
