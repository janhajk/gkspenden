(function() {
// ID des Counters um Verzögerung für ajax abfragen bei Live-Suche zu erzeugen
var gkspendenDelayId = 0;
var firsttime = true;
var initSorter = true;
var pre = 'gk_spenden_'
var fQuery = {
   'name': ''
};
var tbody;
var summe = 0;


document.addEventListener('DOMContentLoaded', function() {
   //Filter einblenden
   var box1 = document.getElementById(pre + 'filter_box1');
   box1.appendChild(fTitle());

   // Suche initialisieren
   gkspenden_search_init(0);

   var results = document.getElementById('gkspenden_results');
   results.appendChild(table());
});


var fTitle = function(){
   var d = document.createElement('div');
   var i = document.createElement('input');
   i.id = pre + 'filter_title';
   i.title = 'Titel oder beliebiger Teil des Titels eingeben. Mehrere W&ouml;rter m&ouml;glich. Es werden nur exakte &Uuml;bereinstimmungen gefunden';
   i.addEventListener('keyup', function(){
      fQuery.name = i.value;
      gkspenden_search_init();
   });
   var l = document.createElement('label');
   l.innerHTML = 'Filtern nach Name:';
   l.for = pre + 'filter_title';
   d.appendChild(l);
   d.appendChild(i);
   return d;
};

var table = function(){
   var columns = ['Spender', 'Spendendatum', 'Betrag', 'Adresse', 'Aktionen'];
   var t = document.createElement('table');
   var thead = document.createElement('thead');
   tbody = document.createElement('tbody');
   tbody.id = pre + 'results_body';
   var tr = document.createElement('tr');
   var fth = function(value) {
      var th = document.createElement('th');
      th.innerHTML = value;
      return th;
   };
   for (var i in columns) {
      tr.appendChild(fth(columns[i]));
   }
   thead.appendChild(tr);
   t.appendChild(thead);
   t.appendChild(tbody);
   return t;
};


var row = function(data) {
   var tr = document.createElement('tr');
   var ftd = function(html) {
      var td = document.createElement('td');
      if(typeof html === 'object') {
         td.appendChild(html);
      } else {
         td.innerHTML = html;
      }
      return td;
   };
   tr.appendChild(ftd(formatNameBlock(data)));
   tr.appendChild(ftd(formatDateBlock(data['spendendatum'])));
   tr.appendChild(ftd(data['betrag'].toLocaleString('de-CH', {
      style: 'currency',
      currency: 'CHF'
   })));
   tr.appendChild(ftd(formatAdressBlock(data)));
   tr.appendChild(ftd(formatEditBlock(data)));
   return tr;
};

var formatAdressBlock = function(data) {
   var strasse = [];
   var ort = [];
   if (data.strasse !== '' && data.strasse !== null) strasse.push(data.strasse);
   if (data.plz !== '' && data.plz !== null) ort.push(data.plz);
   if (data.ort !== '' && data.ort !== null) ort.push(data.ort);
   return [strasse.join(' '), ort.join(' ')].join(', ');
};

var formatNameBlock = function(data) {
   var n = [];
   if (data.vorname !== '' && data.vorname !== null) n.push(data.vorname);
   if (data.nachname !== '' && data.nachname !== null) n.push(data.nachname);
   if (data.firma !== '' && data.firma !== null) n.push(data.firma);
   if (data.zusatz !== '' && data.zusatz !== null) n.push(data.zusatz);
   return n.join(' ');
};

var formatDateBlock = function(datum) {
   var d = new Date(datum*1000);
   return ('0' + d.getDate()).substring(('0' + d.getDate()).length-2) + '.' + ('0' + d.getMonth()).substring(('0' + d.getMonth()).length-2) + '.' + d.getFullYear();
};

var formatEditBlock = function(data) {
   var icon = iconEdit('Spende Bearbeiten');
   var a = documet.createElement('a');
   a.href = '/node/' + data.nid + '/edit';
   a.appendChild(icon);
   return a;
};

/*
 * Initiert die Suche
 *
 * Die Suche wird innerhalb eines timeout's nur einmal durchgeführt
 * ist bereits ein timeout am laufen, wird es erneuert und die Suche
 * wird erneut erst nach dem Ablauf des timeout's ausgeführt
 */

function gkspenden_search_init(timeout) {
   // Default Wert, wenn nicht gesetzt
   timeout = typeof(timeout) != 'undefined' ? timeout : 1000;
   // Wenn Timer bereits läuft, dann reseten
   if(gkspendenDelayId) {
      clearTimeout(gkspendenDelayId);
   }
   // wenn timeout = 0 dann soll er kein Timer setzten, sondern direkt Funktion aufrufen
   // dies wird beim laden ausgelöst und hat zur Folge, dass die Suche wie gefiltert
   // ausgeführt wird, bzw. beim ersten laden, alle Resultate angezeigt werden
   if(timeout == 0) {
      gkspenden_search();
   } else {
      // Timeout setzten
      gkspendenDelayId = window.setTimeout(gkspenden_search, timeout);
      // Export Link für XLS-Export aktualisieren
   }
   //gkspenden_updateExport();
   return true;
}

/*
 * Suche ausführen und Resultate ausgeben
 */

function gkspenden_search() {
   var url = '/spendensuche/results/';
   var request = new XMLHttpRequest();
   request.open('GET', url + 'name=' + fQuery.name, true);

   request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
         var data = JSON.parse(request.responseText);
         tbody.innerHTML = '';
         summe = 0;
         for (var d in data) {
            tbody.appendChild(row(data[d]));
            summe += parseInt(data[d].betrag, 10);
         }
            tbody.appendChild(row({vorname: 'TOTAL:', spendendatum:'', betrag: summe.toLocaleString('de-CH', {style:'currency', currency: 'CHF'})}));
         console.log(data);
      } else {
         // Error

      }
   };

   request.onerror = function() {
      // There was a connection error of some sort
   };
   request.send();
}

var iconEdit = function(title) {
   var img = document.createElement('img');
   img.style.width = '20px';
   img.style.height = '20px';
   img.title = title;
   img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAB1AAAAdQHjwgdlAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGxQTFRFAAAAAAAAAAAAAAAAAAAAAQEBAgICAwMDBAQEJCQkNjY2ODg4Ozs7Pz8/SEhITExMVFRUXV1deHh4e3t7hYWFl5eXmJiYmZmZmpqam5ubnJycnZ2dpKSkpaWlp6enqamps7OzyMjI+/v7////xIiG8wAAAAR0Uk5TAFTN+4wdYmEAAACASURBVHjabdFJEsIwDERRWZKZpzCEyUCC7n9HlIXdWvA3XfW2TZRYNCSc3KLkmXqJONrlNfdhkmhmb1ehYL15n4Uqwa429d00hB0UmG/VgPleDQgD5kc1YH5WA8ICrksz4HEozYA2FLeIot04nlbRhFj3fejsyJR0uQttHdPfO34WIBHwX4VNdwAAAABJRU5ErkJggg==";
   return img;
};

/*
 * Themeing Funktion für Suchresultate
 * wird gemäss der aktuellen VIew ausgeührt für Thumbnails oder Normal (Listenansicht)
 */
/*
function gkspenden_themeResults(view, data) {
   var rows = '';
   var count = 0;
   for(var key in data) {
      if(view === 'Thumbnails') {
         if(data[key]['thumbs'] != '') {
            rows += '<tr><td>' + data[key]['thumbs'] + '</td></tr>';
         }
      } else {
         rows += '<tr><td><a href="/node/' + data[key]['nid'] + '">' + data[key]['title'] + '</a></td>' + '<td>' + data[key]['changed'] + '</td>' + '<td>' + data[key]['date'] + '</td>' + '<td><a href="/user/' + data[key]['uid'] + '">' + data[key]['autor'] + '</a></td>' + '<td>[' + data[key]['filescount'] + ']</td>' + '<td>' + data[key]['groups'] + '</td>' + '<td>' + data[key]['terms'] + '</td>' + '</tr>';
      }
      count++;
   }
   return new Array(count, rows);
}*/


/*
 * setzt den Tabellenkopf für die Suchresultate gemäss der View (Normal oder Thumbnails)
 */
/*
function gkspenden_setHeader(view) {
   var header = (view === 'Thumbnails') ? '<tr><th>Titel</th></tr>' : '<tr><th>Titel</th><th>letzte &Auml;nderung</th><th>Dok-Datum</th><th>Autor</th><th>Dateien</th><th>Gruppen</th><th>Tags</th></tr>';
   $('#gkspenden_results_head').html(header);
}*/
/*
 *
 */
/*
function gkspenden_addDateFilter() {
  //$('#gkspenden_filter_date').prepend();
  $('#gkspenden_filter_date_slider').slider({
    range:  true,
    min:    0,
    max:    Drupal.settings.gkspenden.projekt.range-1,
    values: [0,Drupal.settings.gkspenden.projekt.range-1],
    slide:  function( event, ui ) {
        var from = ui.values[0]*60*60*24 + Drupal.settings.gkspenden.projekt.mindate;
        var to   = ui.values[1]*60*60*24 + Drupal.settings.gkspenden.projekt.mindate;
				$("#gkspenden_filter_date_value").html(phpdate(from) + " - " + phpdate(to));
        $("#gkspenden_filter_date_from").val(from);
        $("#gkspenden_filter_date_to").val(to);
		},
    change: function() {
        gkspenden_search_init(0);
    }
  });
  $("#gkspenden_filter_date_value").html(
    phpdate(Drupal.settings.gkspenden.projekt.mindate) +
    " - " +
    phpdate(Drupal.settings.gkspenden.projekt.maxdate));
}
*/
/*
 *
 *
 *
 * PHP Functions
 *
 *
 *
 *
 * /



/*
 * base64 encoder function
 */

function gkspenden_base64encode(inp) {
   var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
   var chr1, chr2, chr3, enc3, enc4, i = 0,
      out = "";
   while(i < inp.length) {
      chr1 = inp.charCodeAt(i++);
      if(chr1 > 127) chr1 = 88;
      chr2 = inp.charCodeAt(i++);
      if(chr2 > 127) chr2 = 88;
      chr3 = inp.charCodeAt(i++);
      if(chr3 > 127) chr3 = 88;
      if(isNaN(chr3)) {
         enc4 = 64;
         chr3 = 0;
      } else enc4 = chr3 & 63
      if(isNaN(chr2)) {
         enc3 = 64;
         chr2 = 0;
      } else enc3 = ((chr2 << 2) | (chr3 >> 6)) & 63
      out += key.charAt((chr1 >> 2) & 63) + key.charAt(((chr1 << 4) | (chr2 >> 4)) & 63) + key.charAt(enc3) + key.charAt(enc4);
   }
   return encodeURIComponent(out);
}

function phpdate(timestamp) {
   var Zeit = new Date(timestamp * 1000);
   var day = '0' + Zeit.getDate();
   return day.substr(day.length - 2, 2) + '.' + (Zeit.getMonth() + 1) + '.' + Zeit.getFullYear();
}

   



})();