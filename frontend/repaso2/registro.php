<?php
include("conexion.php");
if($_POST){
$cedula = $_POST['cedula'];
$nombre = $_POST['nombre'];

$conn ->query("INSERT INTO clientes values (NULL,'$cedula','$nombre')");
$id_cli = $conn -> insert_id;

$conn -> query("INSERT INTO cuentas values (NULL,'$id_cli',0)");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Registro de usuarios</h1>
    <a href="index.php"><-</a>
    <form method="post">
        Cedula: <input type="text" name="cedula">
        <br>
        Nombre: <input type="text" name="nombre">
        <br>
        <button type="submit">Registrar</button>
    </form>
</body>
</html>

