<?php
/**
 * Diese Fuktion gibt die Dossier-Seite formatiert zurück
 */
function _gkspenden_page($query='') {
  include_once('functions.inc');
  include_once('page.elements.inc');

  $dsPath = drupal_get_path('module', 'gkspenden');

  drupal_add_js ($dsPath.'/jquery-ui-1.12.0/jquery-ui.min.js', 'core', 'footer');
  drupal_add_css($dsPath.'/jquery-ui-1.12.0/jquery-ui.css', 'core');
  drupal_add_js ($dsPath.'/gkspenden.js' , 'module', 'footer');
  drupal_add_css($dsPath.'/gkspenden.css', 'module');
  drupal_add_js (_gkspenden_getJsSettings(), 'setting');

  return
    '<div id="gkspenden_export"><a href="javascript:"><img src="/'.$dsPath. '/csv.gif'.'" width="40" height="16" /></a></div>'.
    '<div id="gkspenden_filters">'._gkspenden_getFilters($query).'</div>'.
    '<div id="gkspenden_results">'.
      '<div id="gkspenden_results_count"></div>'.
      '<table id="gkspenden_results_table">'.
        '<thead id="gkspenden_results_head"></thead>'.
        '<tbody id="gkspenden_results_body"></tbody>'.
      '</table>'.
    '</div>';
}