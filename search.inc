<?php

// Filter:
//   Spender-Name
//   Betrag von-bis
//   Spendendatum von-bis
//   Strasse & Ort & PLZ

function _gkspenden_getresults($query='') {
  $nodes    = array();
  $queries  = array();
  $pQueries = explode(';',$query);
  foreach ($pQueries as $query) {
    $query  = explode('=',$query);
    // exp: $query = 'name=Ein name'
    // exp: $queries['name'] = 'Ein Name'
    //
    // exp: $query = 'name='
    // exp: $queries['name'] = NULL
    $queries[$query[0]] = isset($query[1])?$query[1]:NULL;
  }
  // Clean Input
  $queries['name']    = _gkspenden_cleanString       ($queries['name']) ;
  //$queries['betrag']  = _gkspenden_cleanNumbers     ($queries['betrag']) ;
  //$queries['datum']   = _gkspenden_cleanDatum      ($queries['datum'])  ;
  //$queries['ort']     = _gkspenden_cleanString        ($queries['ort'])  ;
  // Create SQL Strings
  $queries['qName']  = _gkspenden_createQueryString($queries['name'], 'n.spender');
  //$queries['qDatum']   = _gkspenden_createQueryDatum($queries['datum']);
  // Get nodes that match Title Filter Criteria
  $sql =
   'SELECT n.nid FROM {node} n
    LEFT JOIN {content_type_spende} cd
    ON (n.vid = cd.vid)
    WHERE
       n.type LIKE \'spende\' '.
      //'AND cd.field_papierkorb_value LIKE \'normal\' '.
     $queries['qTitle']. ' LIMIT 0,100';
     //$queries['qTitle'].$queries['qDate'];
  //dsm(str_replace(array('{','}'),'',$sql));
  $results = db_query(db_rewrite_sql($sql),$queries['title']);
  while ($r = db_fetch_object($results)) {
    $nodes[$r->nid] = $r->nid;
  }
  return $nodes;
  print_r($sql);
  print_r($nodes);
}

/**
 * Cleans SearchString
 */
function _gkspenden_cleanString($string) {
  if ($string == NULL) return false;
  $string = trim(strtolower($string));
  if ($string == '') return false;
  $string = preg_replace('/[^a-zäöü0-9\-\.\s_]/', '', $string); // enternen von nicht erwünschten Zeichen
  $string = preg_replace('|\s+|', ' ', $string); // entfernen von Mehrfach-abständen
  $string = explode(' ',$string); // einzelne Namen in ein Array
  if (!count($string)) return false;
  $string = array_values($string); // resets array-keys
  return $string;
//return array('John', 'Smith')
}

/**
 * Cleans Numbers
 * exp: $numbers = '10,50'
 * exp: $numbers = ',50'
 */
function _gkspenden_cleanNumbers($numbers, $count=NULL){
   $nums = explode(',', $numbers);
   if ($count != NULL && count($nums) != $count) return false;
   if (count($nums) < 2) return array((int) preg_replace('|[^0-9]|','',$nums[0]));
   return array((int) preg_replace('|[^0-9]|','',$nums[0]),
               (int) preg_replace('|[^0-9]|','',$nums[1]));
}


/**
 * Creates SQL Filter for Searchstring
 * @param array $title array('searchstring1', 'searchstrin2', ...)
 * @return string "AND n.title LIKE '%%%s%%' AND n.title LIKE '%%%s%%'" etc.
 */
function _gkspenden_createQueryString($string, $col, $logic='AND') {
  if (!$string) return '';
  $q = array();
  foreach ($string as $s) {
    $q[] = $col." LIKE '%%%s%%'";   // doppelte %% notwwendig da Drupal %xxx% als Platzhalter in db_rewrite_sql benutzt, und sql als wildcard
  }
  return ' AND ('.implode(' '.$logic.' ', $q).') ';
}

/**
 * Creates SQL Filter for Date
 * @param array $date array(123456789, 987654321) => (timestamp_from, timestamp_to)
 * @return string <i>' AND ((cd.field_dokumentendatum_value >= '1234567' AND
 * cd.field_dokumentendatum_value <= '7654321') OR (n.changed >= 1234567
 * AND n.changed <=7654321) OR (n.created >= 1234567 AND n.created <=7654321))'</i>
 */
function _gkspenden_createQueryDatum($date) {
  if (!$date) return '';
  $datesql = array();
  $from = date("Y-m-d\T00:00:00",$date[0]);
  $to   = date("Y-m-d\T23:59:59",$date[1]);
  $datesql[] = "(cd.field_dokumentendatum_value >= '".$from."' AND cd.field_dokumentendatum_value <= '".$to."')";
  $datesql[] = "(n.changed >= ".$date[0]." AND n.changed <= ".($date[1]+60*60*24-1).")";
  $datesql[] = "(n.created >= ".$date[0]." AND n.created <= ".($date[1]+60*60*24-1).")";
  return ' AND ('.implode(' OR ',$datesql).')';
}
