<?php
/**
 * Diese Fuktion gibt die Dossier-Seite formatiert zurück
 */
function _gkspenden_page($query='') {
  $pre = 'gk_spenden_filter_';
  include_once('functions.inc');

  $dsPath = drupal_get_path('module', 'gkspenden');
   drupal_add_js('//--><!]]></script><script type="text/javascript" src="http://code.jquery.com/jquery-3.1.0.min.js"></script><script type="text/javascript"><!--//--><![CDATA[//><!--',  'inline');
   drupal_add_js ('//--><!]]></script><script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script><script type="text/javascript"><!--//--><![CDATA[//><!--', 'inline', 'footer');

   drupal_add_js ($dsPath.'/gkspenden.js' , 'module', 'footer');
   drupal_add_css($dsPath.'/gkspenden.css', 'module');
   drupal_add_js (_gkspenden_getJsSettings(), 'setting');

  return
    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">'.
    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'.
    '<!--<div id="gkspenden_export"><a href="javascript:"><img src="/'.$dsPath. '/csv.gif'.'" width="40" height="16" /></a></div>-->'.
    '<div id="gkspenden_filters"><div id="'.$pre.'box1">'.
     '</div></div>'.
    '<div id="gkspenden_results">'.
      '<div id="gkspenden_results_count"></div>'.
      '<table id="gkspenden_results_table">'.
        '<thead id="gkspenden_results_head"></thead>'.
        '<tbody id="gkspenden_results_body"></tbody>'.
      '</table>'.
    '</div>';
}



/**
 * Java-Script Einstellungen des Modules
 *
 * @return array Javascript Settings von gkspenden
 */
function _gkspenden_getJsSettings() {
  global $user;
  $uid = $user->uid;
  return array(
      'gkspenden'=>array(
        'path'    => url(drupal_get_path('module', 'gkspenden')),
        // Informationen über das Projekt
        'projekt' => array(
            'mindate' => _gkspenden_oldestDocument(),// ältestes Dokument
            'maxdate' => _gkspenden_midnight(),      // neustes Dokument
            'range'   => ((_gkspenden_midnight()-_gkspenden_oldestDocument())/86400), // Anzahl Tage zwischen ältestem und neustem Dokument
            'lastquery' => variable_get('gkspenden_page_spenden_laststate_'.$uid, ''),
        ),
      ),
  );
}