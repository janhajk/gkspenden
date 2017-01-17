document.addEventListener("DOMContentLoaded", function() {
   (function(){
      var anrede = document.getElementById('edit-field-profil-anrede-value');
      anrede.onchange = function(){
         var anreden = {
            'Herrn' : 'Sehr geehrter Herr %Nachname',
            'Frau': 'Sehr geehrte Frau %Nachname',
            'Herrn und Frau': 'Sehr geehrte Frau %Nachname, sehr geehrter Herr %Nachname',
            'Familie': 'Sehr geehrte Famlie %Nachname',
            'default': 'Sehr geehrte Damen und Herren'
         };
         var value = this.value;
         var Nachname = document.getElementById('edit-field-profil-nachname-0-value').value;
         var klausel = '';
         if (anreden[value]!===undefined) {
            klausel = anreden[value];
         }
         else {
            klausel = anreden.default;
         }
         klausel = klausel.replace(/\%Nachname/g, Nachname);
         var fAnrede = document.getElementById('edit-field-profil-briefanredespez-0-value');
         if (fAnrede.value==='') fAnrede.value = klausel;
      };
   })();
});