(function() {
   // ID des Counters um Verzögerung für ajax abfragen bei Live-Suche zu erzeugen
   var gkspendenDelayId = 0;
   var firsttime = true;
   var initSorter = true;
   var pre = 'gk_spenden_'
   var fQuery = {
      'name': '',
      'adresse': ''
   };
   var tbody;
   var summe = 0;
   document.addEventListener('DOMContentLoaded', function() {
      //Filter einblenden
      var box1 = document.getElementById(pre + 'filter_box1');
      box1.className = 'form-inline';
      box1.appendChild(fTitle());
      box1.appendChild(fAdresse());
      // Suche initialisieren
      gkspenden_search_init(0);
      var results = document.getElementById('gkspenden_results');
      results.appendChild(table());
   });

   var fTitle = function() {
      var d = document.createElement('div');
      d.className = 'form-group';
      var i = document.createElement('input');
      i.id = pre + 'filter_title';
      i.title = 'Titel oder beliebiger Teil des Titels eingeben. Mehrere W&ouml;rter m&ouml;glich. Es werden nur exakte &Uuml;bereinstimmungen gefunden';
      i.addEventListener('keyup', function() {
         fQuery.name = i.value;
         gkspenden_search_init();
      });
      i.className = 'form-control';
      var l = document.createElement('label');
      l.innerHTML = 'Name:';
      l.for = i.id;
      d.appendChild(l);
      d.appendChild(i);
      return d;
   };

   var fAdresse = function() {
      var d = document.createElement('div');
      d.className = 'form-group';
      var i = document.createElement('input');
      i.id = pre + 'filter_adresse';
      i.title = 'Beliebiger Teil der Adresse eingeben. Mehrere W&ouml;rter m&ouml;glich. Es werden nur exakte &Uuml;bereinstimmungen gefunden';
      i.addEventListener('keyup', function() {
         fQuery.adresse = i.value;
         gkspenden_search_init();
      });
      i.className = 'form-control';
      var l = document.createElement('label');
      l.innerHTML = 'Adresse:';
      l.for = i.id;
      d.appendChild(l);
      d.appendChild(i);
      return d;
   };

   var table = function() {
      var columns = ['Spender', 'Spendendatum', 'Betrag', 'Adresse', 'Aktionen'];
      var t = document.createElement('table');
      t.className = 'table table-condensed table-hover table-bordered';
      var thead = document.createElement('thead');
      tbody = document.createElement('tbody');
      tbody.id = pre + 'results_body';
      var tr = document.createElement('tr');
      var fth = function(value) {
         var th = document.createElement('th');
         th.innerHTML = value;
         return th;
      };
      for(var i in columns) {
         tr.appendChild(fth(columns[i]));
      }
      thead.appendChild(tr);
      t.appendChild(thead);
      t.appendChild(tbody);
      var d = document.createElement('div');
      d.className = 'table-responsive';
      d.appendChild(t);
      return d;
   };

   var row = function(data) {
      var tr = document.createElement('tr');
      var ftd = function(html) {
         var td = document.createElement('td');
         if(typeof html === 'object') {
            td.appendChild(html);
         } else if(typeof html === 'undefined') {
            td.innerHTML = '';
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

   /*
    * TODO: Leere Adresse gibt noch komma aus
    */
   var formatAdressBlock = function(data) {
      var strasse = [];
      var ort = [];
      if(data.strasse !== '' && data.strasse !== null) strasse.push(data.strasse);
      if(data.plz !== '' && data.plz !== null) ort.push(data.plz);
      if(data.ort !== '' && data.ort !== null) ort.push(data.ort);
      return [strasse.join(' '), ort.join(' ')].join(', ');
   };

   var formatNameBlock = function(data) {
      var n = [];
      if(data.vorname !== '' && data.vorname !== null) n.push(data.vorname);
      if(data.nachname !== '' && data.nachname !== null) n.push(data.nachname);
      if(data.firma !== '' && data.firma !== null) n.push(data.firma);
      if(data.zusatz !== '' && data.zusatz !== null) n.push(data.zusatz);
      var name = n.join(' ');
      var a = document.createElement('a');
      a.href = '/node/' + data.nid_spender;
      a.text = name;
      return a;
   };

   var formatDateBlock = function(datum) {
      var d = new Date(datum * 1000);
      return('0' + d.getDate()).substring(('0' + d.getDate()).length - 2) + '.' + ('0' + d.getMonth()).substring(('0' + d.getMonth()).length - 2) + '.' + d.getFullYear();
   };

   var formatEditBlock = function(data) {
      var div = document.createElement('div');

      if(data.nid === undefined) return undefined;
      var icon = Icon('edit', 'Spende Bearbeiten');
      var a = document.createElement('a');
      a.href = '/node/' + data.nid + '/edit';
      a.appendChild(icon);
      var div1 = document.createElement('div');
      div1.appendChild(a);
      icon = Icon('add', 'Spende Hinzufügen');
      a = document.createElement('a');
      a.href = '/node/add';
      a.appendChild(icon);
      var div2 = document.createElement('div');
      div2.appendChild(a);
      div2.style.float = 'right';
      div.appendChild(div1).appendChild(div2);
      return div;
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
      //var query = gkspenden_base64encode('name=' + fQuery.name);
      var query = 'name=' + fQuery.name + ';' + 'adresse=' + fQuery.adresse;
      request.open('GET', url + query, true);
      request.onload = function() {
         if(request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            tbody.innerHTML = '';
            summe = 0;
            for(var d in data) {
               tbody.appendChild(row(data[d]));
               summe += parseInt(data[d].betrag, 10);
            }
            tbody.appendChild(row({
               vorname: 'TOTAL:',
               spendendatum: '',
               betrag: summe.toLocaleString('de-CH', {
                  style: 'currency',
                  currency: 'CHF'
               })
            }));
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


   var Icon = function(type, title) {
      var images = {
         'add' : "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADrSURBVDiNzZUxqoNAEIa/iHewFhHBIkWw9RbexMLSE9hb6kmsLdKkUwun1DMksK94IizGhYQt8sMU+8/uV8zs7KKUAsiAO/AE1Ifx3M5mG4vsC8hZZGz0txuKolDLsmhRlqUJeHeBKyfyfR/P8w6eQVcHcE07PpTrWIQBYB144b+Y5HlOGIZaMk1T4jjWvHEc6bpO86Zpoqqqfa0AJSLqW4nI3unfr6F14H4H27YliiItmSQJQRBonojQ973mDcOgrU9Hqa7rQwOapjHO8+/X0AFeFnkvF3gAt3fZeZ5Z1/XgGfQA2w+s7S/gDy6N/oAaaH5VAAAAAElFTkSuQmCC",
         'edit': "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAB1AAAAdQHjwgdlAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGxQTFRFAAAAAAAAAAAAAAAAAAAAAQEBAgICAwMDBAQEJCQkNjY2ODg4Ozs7Pz8/SEhITExMVFRUXV1deHh4e3t7hYWFl5eXmJiYmZmZmpqam5ubnJycnZ2dpKSkpaWlp6enqamps7OzyMjI+/v7////xIiG8wAAAAR0Uk5TAFTN+4wdYmEAAACASURBVHjabdFJEsIwDERRWZKZpzCEyUCC7n9HlIXdWvA3XfW2TZRYNCSc3KLkmXqJONrlNfdhkmhmb1ehYL15n4Uqwa429d00hB0UmG/VgPleDQgD5kc1YH5WA8ICrksz4HEozYA2FLeIot04nlbRhFj3fejsyJR0uQttHdPfO34WIBHwX4VNdwAAAABJRU5ErkJggg=="
      };
      var img = document.createElement('img');
      img.style.width = '20px';
      img.style.height = '20px';
      img.title = title;
      img.src = 'data:image/png;base64,' + images[type];
      return img;
   };
   

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
})();