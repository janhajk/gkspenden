<?php
/**
 * Gibt ein JSON Objekt mit den gefilterten Resultate zurück
 */
function _gkspenden_results_json($query) {
   include_once('search.inc');
   include_once('page.elements.inc');
   include_once('functions.inc');

   $nodes = array();
   drupal_set_header('Content-Type: text/plain; charset: utf-8');
   $nids = _gkspenden_getresults($query);
   foreach ($nids as $key=>$nid) {
      $terms = array();
      $node = node_load($nid);
      $spender = node_load($node->field_spende_spender[0]->nid);
      dsm($node);
      dsm($node->field_spende_spender)
      dsm($spender);
      $nodes[$node->changed.':'.$key] = array(
         'nid'       => $nid,
         //'title'     => $node->title,
         //        'autor'     => $node->name,
         'changed'   => date('d.m.Y',$node->changed),
         //        'date'      => date('d.m.Y',strtotime($node->field_dokumentendatum[0]['value'])),
         'uid'       => $node->uid,
         'betrag'    => $node->field_spende_betrag,
         'spendendatum' => $node->field_spende_datum,
         'spender'   => 'spendername',
         'adresse'   => 'adresse',
      );
   }
   krsort($nodes);
   print drupal_to_js($nodes);
}




/*
 * node_load macht folgenden Output
 *
      nid (String, 6 characters ) 105579
      type (String, 6 characters ) spende
      language (String, 2 characters ) de
      uid (String, 1 characters ) 1
      status (String, 1 characters ) 1
      created (String, 10 characters ) 1234904352
      changed (String, 10 characters ) 1234904352
      comment (String, 1 characters ) 0
      promote (String, 1 characters ) 0
      moderate (String, 1 characters ) 0
      sticky (String, 1 characters ) 0
      tnid (String, 1 characters ) 0
      translate (String, 1 characters ) 0
      vid (String, 6 characters ) 105579
      revision_uid (String, 1 characters ) 1
      title (String, 16 characters ) -Renner-Warth-50
      body (String, 0 characters )
      teaser (String, 0 characters )
      log (String, 0 characters )
      revision_timestamp (String, 10 characters ) 1234904352
      format (String, 1 characters ) 0
      name (String, 5 characters ) admin
      picture (String, 0 characters )
      data (String, 72 characters ) a:1:{s:13:"form_build_id";s:37:"form-ef742e0e68...
      field_spende_datum (Array, 1 element)
         0 (Array, 4 elements)
            value (String, 19 characters ) 2008-11-00T00:00:00
            timezone (String, 3 characters ) UTC
            timezone_db (String, 3 characters ) UTC
            date_type (String, 4 characters ) date | (Callback) date();
      field_spende_beitragsart (Array, 1 element)
         0 (Array, 1 element)
            value (String, 7 characters ) Spender
      field_spende_spender (Array, 1 element)
         0 (Array, 1 element)
            nid (String, 6 characters ) 103960
      field_spende_betrag (Array, 1 element)
         0 (Array, 1 element)
            value (String, 5 characters ) 50.00
      field_spende_memo (Array, 1 element)
         0 (Array, 2 elements)
            value (String, 4 characters ) Memo
            format (NULL)
      taxonomy (Array, 0 elements)