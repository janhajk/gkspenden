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
      $spender = node_load($node->field_spende_spender[0]['nid']);
      $nodes[$node->changed.':'.$key] = array(
         'changed'      => date('d.m.Y',$node->changed),
         'created'      => date('d.m.Y',$node->created),
         'spendendatum' => date('d.m.Y',$node->field_spende_datum[0]['value']),
         'nid'          => $nid,
         'creator'      => $node->uid,
         'betrag'       => $node->field_spende_betrag[0]['value'] ,
         'vorname'      => $spender->field_profil_vorname[0]['value'],
         'nachname'     => $spender->field_profil_nachname[0]['value'],
         'firma'        => $spender->field_profil_firma[0]['value'],
         'zusatz'       => $spender->field_profil_zusatz[0]['value'],
         'anrede'       => $spender->field_profil_anrede[0]['value'],
         'strasse'      => $spender->field_profil_strasse[0]['value'],
         'plz'          => $spender->field_profil_plz[0]['value'],
         'ort'          => $spender->field_profil_ort[0]['value'],
         'telp'         => $spender->field_profil_telp[0]['value'],
         'telg'         => $spender->field_profil_telg[0]['value'],
         'handy'        => $spender->field_profil_handy[0]['value'],
         'faxg'         => $spender->field_profil_faxg[0]['value'],
         'mail'         => $spender->field_profil_mail[0]['value'],
         'geburtstag'   => $spender->field_profil_geburtstag[0]['value'],
         'eintritt'     => $spender->field_profil_eintritt[0]['value'],
         'verdankung'   => $spender->field_profil_verdankung[0]['value'],
         'imjhrbericht' => $spender->field_profil_imjahresbericht[0]['value'],
         'memo'         => $spender->field_profil_neni[0]['value'],
         'anredespez'   => $spender->field_profil_briefanredespez[0]['value'],
      );
   }
   krsort($nodes);
   print drupal_to_js($nodes);
}




/*
 * node_load output
 * "Spende"
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




"Spender"
   nid (String, 6 characters ) 103960
   type (String, 7 characters ) profile
   language (String, 2 characters ) de
   uid (String, 1 characters ) 1
   status (String, 1 characters ) 1
   created (String, 10 characters ) 1234904344
   changed (String, 10 characters ) 1460634018
   comment (String, 1 characters ) 0
   promote (String, 1 characters ) 0
   moderate (String, 1 characters ) 0
   sticky (String, 1 characters ) 0
   tnid (String, 1 characters ) 0
   translate (String, 1 characters ) 0
   vid (String, 6 characters ) 103960
   revision_uid (String, 2 characters ) 11
   title (String, 24 characters ) vorname nachname
   body (String, 0 characters )
   teaser (String, 0 characters )
   log (String, 0 characters )
   revision_timestamp (String, 10 characters ) 1460634018
   format (String, 1 characters ) 0
   name (String, 5 characters ) admin
   picture (String, 0 characters )
   data (String, 72 characters ) a:1:{s:13:"form_build_id";s:37:"form-ef742e0e68...
   field_profil_vorname (Array, 1 element)
      0 (Array, 1 element)
         value (String, 10 characters ) Vorname
   field_profil_nachname (Array, 1 element)
      0 (Array, 1 element)
         value (String, 12 characters ) Nachname
   field_profil_firma (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_zusatz (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_anrede (Array, 1 element)
      0 (Array, 1 element)
         value (String, 5 characters ) Herrn
   field_profil_strasse (Array, 1 element)
      0 (Array, 1 element)
         value (String, 11 characters ) Musterstrasse 1
   field_profil_plz (Array, 1 element)
      0 (Array, 1 element)
         value (String, 4 characters ) 1234
   field_profil_ort (Array, 1 element)
      0 (Array, 1 element)
         value (String, 12 characters ) Musterhausen
   field_profil_telp (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_telg (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_handy (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_faxg (Array, 1 element)
      0 (Array, 1 element)
         value (NULL)
   field_profil_mail (Array, 1 element)
      0 (Array, 1 element)
         email (NULL)
   field_profil_geburtstag (Array, 1 element)
      0 (Array, 4 elements)
         value (NULL)
         timezone (String, 3 characters ) UTC
         timezone_db (String, 3 characters ) UTC
         date_type (String, 4 characters ) date | (Callback) date();
   field_profil_eintritt (Array, 1 element)
      0 (Array, 4 elements)
         value (NULL)
         timezone (String, 3 characters ) UTC
         timezone_db (String, 3 characters ) UTC
         date_type (String, 4 characters ) date | (Callback) date();
   field_profil_verdankung (Array, 1 element)
      0 (Array, 1 element)
         value (String, 5 characters ) keine
   field_profil_imjahresbericht (Array, 1 element)
      0 (Array, 1 element)
         value (String, 2 characters ) ja
   field_profil_memo (Array, 1 element)
      0 (Array, 2 elements)
         value (String, 11 characters ) <p>2011</p>
         format (String, 1 characters ) 1
   field_profil_briefanredespez (Array, 1 element)
      0 (Array, 1 element)
         value (String, 35 characters ) Sehr geehrter Herr Superman
   field_profile_adresse_id (Array, 1 element)
      0 (Array, 1 element)
         value (String, 4 characters ) 2752
   field_profil_inaktiv (Array, 1 element)
      0 (Array, 1 element)
         value (String, 5 characters ) Aktiv
   taxonomy (Array, 1 element)
      5 (Object) stdClass
         tid (String, 1 characters ) 5
         vid (String, 1 characters ) 2
         name (String, 6 characters ) privat
         description (String, 0 characters )
         weight (String, 1 characters ) 0
   
 */