<?php
/**
 * UID -> Username conversion
 * @param integer $uid Eine Drupal User-ID
 * @return string Benutzername
 */
function _gkspenden_uid2username($uid) {
  $sql = "SELECT {users}.name FROM ({users}, {node} n) WHERE {users}.uid = '%d'";
  $result = db_query(db_rewrite_sql($sql), $uid);
  return db_fetch_object($result)->name;
}
/**
 * Nimmt den aktuellen Tag und gibt den den UNIX-Timestamp
 * von 23:59:59 des Tages zurück.
 * @return UNIX-timestamp
 */
function _gkspenden_midnight() {
  return mktime(0,0,0,date('n'),date('j')+1,date('Y'));
}



/**
 * Findet das Datum des ältesten Dossiers in der Ablage
 * @return integer timestamp des ältesten Dossiers
 */
function _gkspenden_oldestDocument() {
  // Cache oldest Document
  static $oDate = false;
  if ($oDate) return $oDate;
  $sql = "SELECT field_spende_datum_value FROM {content_type_spende} ORDER BY field_spende_datum_value ASC LIMIT 0,1";
  $result = db_query($sql);
  $date1 = db_fetch_object($result)->field_spende_datum_value;
  $date1 = mktime(0,0,0,date('n',$date1),date('j',$date1),date('Y',$date1));
  $oDate = $date1; // write to static cache
  return $oDate;
}
