<?php

// Filter:
//   Spender-Name
//   Betrag von-bis
//   Spendendatum von-bis
//   Strasse & Ort & PLZ

function _gkspenden_getresults($query='') {
   print 'Query: '.print_r($query,1)."\n\r";
   print 'Arg(1): '.print_r(arg(1),1)."\n\r";
   print 'Arg(2): '.print_r(arg(2),1)."\n\r";
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
   print_r($queries);
   // Clean Input
   $queries['name']    = _gkspenden_cleanString ($queries['name']);
   $queries['adresse' ]= _gkspenden_cleanString ($queries['adresse']);
   //$queries['betrag']  = _gkspenden_cleanNumbers     ($queries['betrag']) ;
   //$queries['datum']   = _gkspenden_cleanDatum      ($queries['datum'])  ;
   //$queries['ort']     = _gkspenden_cleanString        ($queries['ort'])  ;
   // Create SQL Strings
   $queries['qName']     = _gkspenden_createQueryString($queries['name'], array('{node}.title'));
   $queries['qAdresse']  = _gkspenden_createQueryString($queries['adresse'], array('p.field_profil_strasse_value', 'p.field_profil_ort_value', 'p.field_profil_plz_value'));
   //$queries['qDatum']   = _gkspenden_createQueryDatum($queries['datum']);
   // Get nodes that match Title Filter Criteria
   $sql =
      'SELECT n.nid FROM {node} n
    LEFT JOIN {content_type_spende} cd
    ON (n.vid = cd.vid)
    LEFT JOIN {node}
    ON (cd.field_spende_spender_nid = {node}.nid)
    LEFT JOIN {content_type_profile} p
    ON (p.vid = n.vid)
    WHERE
       n.type LIKE \'spende\' '.
      $queries['qName'].$queries['qAdresse']. ' ORDER BY cd.field_spende_datum_value DESC, cd.field_spende_betrag_value DESC LIMIT 0,100';
   print_r(preg_replace("/{|}/", "", $sql));
   //$queries['qTitle'].$queries['qDate'];
   dsm(str_replace(array('{','}'),'',$sql));
   $results = db_query(db_rewrite_sql($sql),$queries['name']);
   while ($r = db_fetch_object($results)) {
      $nodes[$r->nid] = $r->nid;
   }
   return $nodes;
   //print_r($nodes);
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
 * @return string "AND ((col1 LIKE '%%%s1%%' OR col2 LIKE '%%%s1%%'") AND (col1 LIKE '%%%s2%%' OR col2 LIKE '%%%s2%%'")) etc.
 */
function _gkspenden_createQueryString($string, $cols, $logic='AND') {
   if (!$string) return '';
   $q = array();
   $sq = array();
   foreach ($string as $s) {
      foreach ($cols as $c) {
         $sq[] = $c." LIKE '%%%s%%'";   // doppelte %% notwwendig da Drupal %xxx% als Platzhalter in db_rewrite_sql benutzt, und sql als wildcard
      }
      $q[] = '('.implode(' OR ', $sq).')';
      $sq = array();
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
