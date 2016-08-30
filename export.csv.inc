<?php
include_once('search.inc');
/*
 * exportiert ein Suchresultat in eine CSV Datei und gibt diese aus
 * query kommt base64 enkodiert
 */
function _gkspenden_export_csv($query) {
  $query = base64_decode($query);
  $nodes = _gkspenden_getresults($query);
  $out = '';
  $out .= '"Link/Dossier-ID"'.chr(9).'"Titel"'.chr(9).'"Autor"'.chr(9).'"Letzte Aenderung"'.chr(9).'"Dateiname"'."\n";
  foreach ($nodes as $nid) {
    $node = node_load($nid);
    foreach ($node->field_dateien as $datei) {
      $out .= '"http://abac-bs.ch/node/'.$nid.'"'.chr(9);
      $out .= '"'.utf8_decode($node->title).'"'.chr(9);
      $out .= '"'.utf8_decode($node->name).'"'.chr(9);
      $out .= '"'.date('d.m.Y',$node->changed).'"'.chr(9);
      $out .= '"'.$datei['filename'].'"'.chr(9);
      $out .= "\n";
    }
  }
  drupal_set_header('Content-Type: application/vnd.ms-excel; charset: utf-8');
  drupal_set_header('Content-Disposition: attachment; filename='.date('Ymd',time()).'_Dossierexport_gefiltert.xls; size='.strlen($out));
  print $out;
}