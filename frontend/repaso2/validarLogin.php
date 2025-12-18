<?php
include("conexion.php");
session_start();

$usuario = $_POST['usuario'];
$pass = $_POST['password'];

$res = $conn ->query("SELECT * FROM usuarios WHERE usuario = '$usuario' AND password='$pass'");
if($res -> num_rows >0){
    $_SESSION['usuario'] = $usuario;
    header("location: index.php");
}else{
    echo"Login incorrecto";
}

?>