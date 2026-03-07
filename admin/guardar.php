$imagenesGuardadas = [];

if(!empty($_FILES['imagenes']['name'][0])){

foreach($_FILES['imagenes']['name'] as $key => $nombre){

if($_FILES['imagenes']['error'][$key] == 0){

$nombreFinal = time() . "_" . $key . "_" . basename($nombre);
move_uploaded_file(
$_FILES['imagenes']['tmp_name'][$key],
"../img/" . $nombreFinal
);

$imagenesGuardadas[] = $nombreFinal;
}
}
}

$imagenesString = implode(",", $imagenesGuardadas);