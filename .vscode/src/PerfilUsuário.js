let fotoPerfil= document.getElementById('avatar');
let inputFoto = document.getElementById('foto-perfil');

inputFoto.onchange =  function(){
    fotoPerfil.src = URL.createObjectURL(inputFoto.files[0]);
}