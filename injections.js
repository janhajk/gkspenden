document.addEventListener("DOMContentLoaded", function() {
   (function(){
      var anrede = document.getElementById('edit-field-profil-anrede-value');
      anrede.onchange = function(){
         var value = this.value;
         var Nachname = document.getElementById('edit-field-profil-nachname-0-value').value;
         var klausel = '';
         if (value==='Herrn') {
            klausel = 'Sehr geehrter Herr ' + Nachname;
         }
         else if (value==='Frau') {
            klausel = 'Sehr geehrte Frau ' + Nachname;
         }
         else if (value==='Herrn und Frau') {
            klausel = 'Sehr geehrte Frau ' + Nachname + ', sehr geehrter Herr ' + Nachname;
         }
         else if (value==='Familie') {
            klausel = 'Sehr geehrte Familie ' + Nachname;
         }
         else {
            klausel = 'Sehr geehrte Damen und Herren';
         }
         var fAnrede = document.getElementById('edit-field-profil-briefanredespez-0-value');
         if (fAnrede==='') fAnrede = klausel;
      };
   })();
});