<?php
/**
 * Gibt alle Filter HTML-Formatiert zurück
 * @return string HTML-Code der Filter
 */
function _gkspenden_getFilters($query='') {
  $pre       = 'gkspenden_filter_';
  $fTitle    = '<div class="gkspenden_filter_terms">'.
                 '<label>Filtern nach Titel:'.
                   '<input type   = "text" '.
                           'id    = "'.$pre.'title" '.
                           'name  = "title" '.
                           'value = "'.($query!=''?$query:'').'" '.
                           'title = "Titel oder beliebiger Teil des Titels eingeben. '.
                                    'Mehrere W&ouml;rter m&ouml;glich. Es werden nur '.
                                    'exakte &Uuml;bereinstimmungen gefunden">'.
                 '</label>'.
               '</div>';
  $group     = '<div class="gkspenden_filter_terms">'.
                 '<label for="'.$pre.'group_select">nach Autorengruppe:'.
                   '<select id="'.$pre.'group_select">'._gkspenden_getAuthorGroups().'</select>'.
                 '</label>'.
               '</div>';
  $date      = '<div id="'.$pre.'date" style="clear:both">nach Datum (Dokument, letzte &Auml;nderung):'.
                  '<div id="'.$pre.'date_slider"></div>'.
                  '<div id="'.$pre.'date_value">von: bis:</div>'.
                  '<input id="'.$pre.'date_from" value="0" type="hidden" />'.
                  '<input id="'.$pre.'date_to"   value="0" type="hidden" />'.
               '</div>';
  $taxonomy  = _gkspenden_getTermDropdown(1).
               _gkspenden_getTermDropdown(2).
               _gkspenden_getTermDropdown(3);
  return       '<div id="'.$pre.'box1">'.
                   $fTitle.
                   $taxonomy.
                   $group.
                   $date.
               '</div>'.
               '<div id="'.$pre.'box2">'.
                   $gmap.
               '</div>';
}
/**
 * Gibt ein Dropdown eines Vokabulares aus mit den
 * einzelnen Termen als Optionen
 * @param  integer $vid ID des Vokabulares
 * @return string HTML-Formatiertes Dropdown in einem DIV-Wrapper
 */
function _gkspenden_getTermDropdown($vid) {
  $results  = db_query('SELECT name FROM vocabulary WHERE vid = %d LIMIT 0,1', $vid);
  $vTitle   = db_fetch_object($results)->name;
  $pre      = 'gkspenden_filter_';
  return    '<div class="'.$pre.'terms">'.
              '<label>nach&nbsp;<span>'.$vTitle.'</span>:'.
                '<select id="'.$pre.strtolower($vTitle).'_select">'.
                  _gkspenden_getTermOptions($vid).
                '</select>'.
              '</label>'.
            '</div>';
}


/**
 * Java-Script Einstellungen des Modules
 *
 * @return array Javascript Settings von gkspenden
 */
function _gkspenden_getJsSettings() {
  return array(
      'gkspenden'=>array(
        'path'    => url(drupal_get_path('module', 'gkspenden')),
        // Informationen über das Projekt
        'projekt' => array(
            //'mindate' => _gkspenden_oldestDocument(),// ältestes Dokument
            'maxdate' => _gkspenden_midnight(),      // neustes Dokument
            'range'   => ((_gkspenden_midnight()-_gkspenden_oldestDocument())/86400), // Anzahl Tage zwischen ältestem und neustem Dokument
        ),
      ),
  );
}



/**
 * Gibt die Terme als <option>'s eines Vokabulares zurück
 * @param  integer $vid ID des Vokabulares
 * @return string '<option value="">...</option><option...'
 */
function _gkspenden_getTermOptions($vid) {
  $terms = taxonomy_get_nested_tree($vid);
  $options = array();
  $options[] = '<option value="0">-- alle --</option>';
  foreach ($terms as $t) {
    $options[] = _gkspenden_getTermOptionsFromParent($t);

  }
  return implode('', $options);
}

function _gkspenden_getTermOptionsFromParent($term) {
  $options = array();
  $options[] = '<option value="'.$term->tid.'" class="gkspenden_filter_terms_'.$term->depth.'">'.str_repeat('-',3*$term->depth).$term->name.'</option>';
  if (isset($term->children)) {
    foreach ($term->children as $child) {
      $options[] = _gkspenden_getTermOptionsFromParent($child);
    }
  }
  return implode('',$options);
}

function taxonomy_get_nested_tree($terms = array(), $max_depth = NULL, $parent = 0, $parents_index = array(), $depth = 0) {
  if (is_int($terms)) {
    $terms = taxonomy_get_tree($terms);
  }
  foreach($terms as $term) {
    foreach($term->parents as $term_parent) {
      if ($term_parent == $parent) {
        $return[$term->tid] = $term;
      }
      else {
        $parents_index[$term_parent][$term->tid] = $term;
      }
    }
  }
  foreach($return as &$term) {
    if (isset($parents_index[$term->tid]) && (is_null($max_depth) || $depth < $max_depth)) {
      $term->children = taxonomy_get_nested_tree($parents_index[$term->tid], $max_depth, $term->tid, $parents_index, $depth + 1);
    }
  }
  return $return;
}