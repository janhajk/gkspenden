// ID des Counters um Verzögerung für ajax abfragen bei Live-Suche zu erzeugen
var gkspendenDelayId = 0;

var firsttime = true;
var initSorter = true;

if(Drupal.jsEnabled) {
  $(document).ready(
    function() {
      //$('#gkspenden_results table').tablesorter({headers: {1:{sorter:'germandate'}}});
      //gkspenden_addDateFilter();

      $('#gkspenden_filters').fadeIn(400);
      //$('#gkspenden_filter_group_select').attr("disabled", true);

      // Initial Suche
      gkspenden_search_init(0);

      // Filtert liste wenn Text in Titel-Filter eingegeben wurde
      $('#gkspenden_filter_title').keyup(function() {
        gkspenden_search_init();
      });

      // Filtert Liste nach Taxonomy Select Change
      $('#gkspenden_filter_projektgebiet_select,'+
        '#gkspenden_filter_fachgebiet_select,'+
        '#gkspenden_filter_dateityp_select,'+
        '#gkspenden_filter_group_select').change(function(){
          gkspenden_search_init(0);
      });
    }
  );
}

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
  if (gkspendenDelayId) {
    clearTimeout(gkspendenDelayId);
  }
  // wenn timeout = 0 dann soll er kein Timer setzten, sondern direkt Funktion aufrufen
  if (timeout == 0) {
    gkspenden_search();
  }
  else {
    // Timeout setzten
    gkspendenDelayId = window.setTimeout('gkspenden_search()', timeout);
    // Export Link für XLS-Export aktualisieren
  }
  gkspenden_updateExport();
  return true;
}

/*
 * Sammelt alle Teilbedingungen/Filter für die Query
 */
function gkspenden_getQuery() {
  var query = 'title='       + $('#gkspenden_filter_title').val();
  query += ';group='         + $('#gkspenden_filter_group_select').val();
  query += ';date='          + $("#gkspenden_filter_date_from").val()+','+$("#gkspenden_filter_date_to").val();
  query += ';terms='         + $('#gkspenden_filter_fachgebiet_select').val();
  query += ','               + $('#gkspenden_filter_dateityp_select').val();
  query += ','               + $('#gkspenden_filter_projektgebiet_select').val();
  return query;
}

/*
 * Suche ausführen und Resultate ausgeben
 */
function gkspenden_search() {
  var query = gkspenden_getQuery();

  // Fire AJAX-Search
  $.getJSON('/spendensuche/results/'+query, function (data) {
    gkspendenNodes = data;                                      // Suchresultate in Globaler Variable speichern
    var results = gkspenden_themeResults(view,data);          // Resultate in HTML Formatieren
    $('#gkspenden_results_count').html('Anzahl gefundene Resultate: ' + results[0]);
    $('#gkspenden_results_body').empty();                // Suchresultate ausblenden und danach leeren
    $('#gkspenden_results table').trigger("reset");
    gkspenden_setHeader(view);                                  // Header der Tabelle aendern
    $('#gkspenden_results table tbody').html(results[1]);
    $('#gkspenden_results_body').css('text-align','left').fadeIn(); // Resultate anzeigen
    previews_init();
  });
  return true;
}


/*
 * aktualisiert bei jeder filter-änderung den Link des CSV-Export-Buttons
 */
function gkspenden_updateExport() {
  var query = gkspenden_getQuery();
  $('#gkspenden_export a').attr('href','/spendensuche/export/' + gkspenden_base64encode(query));
}


/*
 * Themeing Funktion für Suchresultate
 * wird gemäss der aktuellen VIew ausgeührt für Thumbnails oder Normal (Listenansicht)
 */
function gkspenden_themeResults(view,data) {
  var rows = '';
  var count = 0;

  for (var key in data) {
    if (view === 'Thumbnails') {
      if (data[key]['thumbs'] != '') {
        rows += '<tr><td>' + data[key]['thumbs'] + '</td></tr>';
      }
    }
    else {
      rows += '<tr><td><a href="/node/' + data[key]['nid'] + '">' + data[key]['title'] + '</a></td>'+
              '<td>' + data[key]['changed'] + '</td>'+
              '<td>' + data[key]['date'] + '</td>'+
              '<td><a href="/user/' + data[key]['uid'] + '">' + data[key]['autor'] + '</a></td>'+
              '<td>[' + data[key]['filescount'] + ']</td>'+
              '<td>' + data[key]['groups'] + '</td>'+
              '<td>' + data[key]['terms'] + '</td>'+
              '</tr>';
    }
    count++;
  }
  return new Array(count,rows);
}

/*
 * setzt den Tabellenkopf für die Suchresultate gemäss der View (Normal oder Thumbnails)
 */
function gkspenden_setHeader(view) {
  var header = (view === 'Thumbnails') 
    ? '<tr><th>Titel</th></tr>'
    : '<tr><th>Titel</th><th>letzte &Auml;nderung</th><th>Dok-Datum</th><th>Autor</th><th>Dateien</th><th>Gruppen</th><th>Tags</th></tr>';
  $('#gkspenden_results_head').html(header);
}


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
function gkspenden_base64encode(inp){
    var key="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var chr1,chr2,chr3,enc3,enc4,i=0,out="";
    while(i<inp.length){
        chr1=inp.charCodeAt(i++);if(chr1>127) chr1=88;
        chr2=inp.charCodeAt(i++);if(chr2>127) chr2=88;
        chr3=inp.charCodeAt(i++);if(chr3>127) chr3=88;
        if(isNaN(chr3)) {enc4=64;chr3=0;} else enc4=chr3&63
        if(isNaN(chr2)) {enc3=64;chr2=0;} else enc3=((chr2<<2)|(chr3>>6))&63
        out+=key.charAt((chr1>>2)&63)+key.charAt(((chr1<<4)|(chr2>>4))&63)+key.charAt(enc3)+key.charAt(enc4);
    }
    return encodeURIComponent(out);
}

function phpdate(timestamp) {
  var Zeit = new Date(timestamp*1000);
  var day  = '0' + Zeit.getDate();
  return day.substr(day.length-2,2) + '.' + (Zeit.getMonth()+1) + '.' + Zeit.getFullYear();
}