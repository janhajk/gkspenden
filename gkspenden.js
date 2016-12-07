(function() {
   var debug = false;
   // Spalten ind er Reihenfolge der Darstellung
   var columns = ['Spendendatum', 'Spender', 'Betrag', 'Adresse', 'Aktionen'];

   // beginnt mit Feb, da Drupal für Monat immer letzter Tag des Vormonates 00:00:00 nimmt, bsp Jan 2016 = 31.12.2015
   var monate = [null, 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan'];

   // ID des Counters um Verzögerung für ajax abfragen bei Live-Suche zu erzeugen
   var gkspendenDelayId = 0;
   var fQuery = {
      'Name': '',
      'Adresse': ''
   };
   var tbody;
   var summe = 0;
   document.addEventListener('DOMContentLoaded', function() {
      //Filter einblenden
      var box1 = document.getElementById('gk_spenden_filter_box1');
      box1.className = 'form-inline';
      box1.appendChild(fText('Name'));
      box1.appendChild(fText('Adresse'));
      // Suche initialisieren
      gkspenden_search_init(0);
      var results = document.getElementById('gkspenden_results');
      results.appendChild(table());
   });

   var table = function() {
      var t = document.createElement('table');
      t.className = 'table table-condensed table-hover table-bordered';  // bootstrap class
      var thead = document.createElement('thead');
      tbody = document.createElement('tbody');
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
      var cols = {};
      for (var i in columns) {
         cols[columns[i]] = {};
      }
      var tr = document.createElement('tr');
      var ftd = function(html, align) {
         if(typeof align==='undefined' ){
            align = 'left';
         }
         var td = document.createElement('td');
         if(typeof html === 'object') {
            td.appendChild(html);
         } else if(typeof html === 'undefined') {
            td.innerHTML = '';
         } else {
            td.innerHTML = html;
         }
         td.style.textAlign = align;
         return td;
      };
      cols.Spender = ftd(formatNameBlock(data));
      cols.Spendendatum = ftd(formatDateBlock(data['spendendatum']) + formatMemo(data).outerHTML);
      cols.Betrag = ftd(data['betrag'].toLocaleString('de-CH', {
         style: 'currency',
         currency: 'CHF'
      }), 'right');
      cols.Adresse = ftd(formatAdressBlock(data));
      cols.Aktionen = ftd(formatEditBlock(data));
      for (var i in cols) {
         tr.appendChild(cols[i]);
      }
      return tr;
   };

   var fText = function(name) {
      var d = document.createElement('div');
      d.className = 'form-group';  // bootstrap class
      var i = document.createElement('input');
      i.id = 'gkspenden_' + Math.random().toString(36).substring(7);
      i.title = name + ' oder beliebiger Teil von "' + name + '" eingeben. Mehrere Wörter möglich. Es werden nur exakte Übereinstimmungen gefunden';
      i.addEventListener('keyup', function() {
         fQuery[name] = i.value;
         gkspenden_search_init();
      });
      i.className = 'form-control'; // bootstrap class
      var l = document.createElement('label');
      l.innerHTML = name + ':';
      l.for = i.id;
      d.appendChild(l);
      d.appendChild(i);
      return d;
   };

   /*
    * TODO: Leere Adresse gibt noch komma aus
    */
   var formatAdressBlock = function(data) {
      if (data.strasse===null && data.ort===null) return '';
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

   /*
    * formatiert ein Datum
    * @param string datum z.B. 147785000
    */
   var formatDateBlock = function(datum) {
      if (datum === '') return '';
      var d = new Date(datum * 1000);
      var year = d.getFullYear();
      var month = d.getMonth();
      return monate[month+1] + ' ' + (year+(month===11?1:0));
   };

   /*
    * Todo: edit spender icon > glyphicon-user
    */
   var formatEditBlock = function(data) {
      var div = document.createElement('div');
      if(data.nid === undefined) return undefined;
      div.appendChild(bootstrapIcon('cog', 'Spende bearbeiten', '/node/' + data.nid + '/edit'));
      var plus = bootstrapIcon('plus', 'Spende hinzufügen', '/node/add/spende/?spenderid=' + data.nid_spender);
      plus.style.marginLeft = '5px';
      div.appendChild(plus);
      return div;
   };

   var formatMemo = function(data) {
      if (data.memo === null) return '';
      var icon = bootstrapIcon('pushpin', data.memo);
      icon.style.marginLeft = '5px';
      return icon;
   };

   /*
    * Initiert die Suche
    *
    * Die Suche wird innerhalb eines timeout's nur einmal durchgeführt
    * ist bereits ein timeout am laufen, wird es erneuert und die Suche
    * wird erneut erst nach dem Ablauf des timeout's ausgeführt
    */

   var gkspenden_search_init = function(timeout) {
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
         // Timeout in Variable speichern
         gkspendenDelayId = window.setTimeout(gkspenden_search, timeout);
      }
      return true;
   };



   /*
    * Suche ausführen und Resultate ausgeben
    */
   var gkspenden_search = function() {
      var url = '/spendensuche/results/';
      var request = new XMLHttpRequest();
      var query = 'name=' + fQuery.Name + ';' + 'adresse=' + fQuery.Adresse;
      request.open('GET', url + query, true);
      request.onload = function() {
         if(request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            tbody.innerHTML = ''; // alte Datensätze aus Tabelle löschen
            summe = 0;
            for(var d in data) {
               tbody.appendChild(row(data[d]));
               summe += parseInt(data[d].betrag, 10);
            }
            tbody.appendChild(row({
               vorname: 'TOTAL:',
               spendendatum: '',
               memo:null,
               strasse: null,
               ort: null,
               betrag: summe.toLocaleString('de-CH', {
                  style: 'currency',
                  currency: 'CHF'
               })
            }));
            if (debug) console.log(data);
         } else {
            // Error
         }
      };
      request.onerror = function() {
         // There was a connection error of some sort
      };
      request.send();
   };


   /*
    * Erzeugt ein html-img mit Icon aus der Icon-Library
    */
   var bootstrapIcon = function(name, title, link) {
      var span = document.createElement('span');
      span.className = 'glyphicon glyphicon-' + name;
      span.title = title;
      if (typeof link!=='undefined') {
         var a = document.createElement('a');
         a.href = link;
         a.appendChild(span)
         return a;
      }
      return span;
   };

})();