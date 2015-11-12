//Load settings
Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL('https://benecollyridam.github.io/rejseplanentilpebble/');
});

Pebble.addEventListener('webviewclosed', function(e) {
  var mySettings = JSON.parse(decodeURIComponent(e.response));
  localStorage.setItem(0, mySettings.origin);
  localStorage.setItem(1, mySettings.dest);
});

// Import dependencies
var UI = require('ui');
var ajax = require('ajax');

// Create a simple Card
var card = new UI.Card({
  title: 'Rejseplanen',
  body: 'Får data!',
  scrollable: true
});

// Make menu
var menu = new UI.Menu({
  sections: [{
    title: 'Rejseplanen',
    items: [{title: 'Ud', subtitle: 'Næste afgang'}, 
            {title: 'Hjem', subtitle: "Næste afgang"},
            {title: 'Tag mig hjem', subtitle: 'Næste afgang'}]
  }]
});
menu.show();

// Check if settings are avalible
if(localStorage.getItem(0) === null || localStorage.getItem(1) === null){
  card.title("Konfigurer appen fra din telefon.");
  card.body("Ellers virker den ikke.");
  card.show();
}

//Make functions
function description(d){
  var text = "";
  for(var i in d.TripList.Trip[0].Leg){
        text += d.TripList.Trip[0].Leg[i].Origin.time.toString() + " Tag " + d.TripList.Trip[0].Leg[i].name + " fra " + d.TripList.Trip[0].Leg[i].Origin.name + " til " + d.TripList.Trip[0].Leg[i].Destination.name + "\n";
  }
  return text;
}

function hjem(){
  var URL = "http://xmlopen.rejseplanen.dk/bin/rest.exe/trip?originId=" + localStorage.getItem(1) + "&destId=" + localStorage.getItem(0) + "&format=json";
  ajax({url: URL,
      type: 'json'},
    function(data){
      var text = description(data);
      card.body(text);
      card.title("Hjem");
      card.show();
    },
    function(error){
      card.title("Error");
      card.body(error);
    });
}

function ud(){
  var URL = "http://xmlopen.rejseplanen.dk/bin/rest.exe/trip?originId=" + localStorage.getItem(0) + "&destId=" + localStorage.getItem(1) + "&format=json";
ajax({url: URL,
      type: 'json'},
    function(data){
      var text = description(data);
      card.body(text);
      card.title("Til arbejde/skole");
      card.show();
    },
    function(error){
      card.title("Error");
      card.body(error);
    });
}

function tagMigHjem(){
  navigator.geolocation.getCurrentPosition(function(position) {
    var URL = "http://xmlopen.rejseplanen.dk/bin/rest.exe/trip?originCoordX="+ parseInt(position.coords.longitude*1000000).toString() + "&originCoordY="+ parseInt(position.coords.latitude*1000000).toString() + "&originCoordName=her&destId=" + localStorage.getItem(0) + "&format=json";
ajax({url: URL,
      type: 'json'},
    function(data){
      var text;
      try{
        text = description(data);
      }catch(e){
        card.title("Kunne ikke få GPS position");
        card.body("Prøv igen senere");
        card.show();
        console.log(e.message);
        return 1;
      }
      card.body(text);
      card.title("Tag mig hjem");
      card.show();
    },
    function(error){
      card.title("Error");
      card.body(error);
    });
  });
  
}

menu.on('select', function(e){
  if(e.itemIndex === 0){
    ud();
  }else if(e.itemIndex === 1){
    hjem();
  }else{
    tagMigHjem();
  }
});