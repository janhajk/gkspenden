<?php

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