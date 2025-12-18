<?php

$conn = new mysqli("localhost","root","","banconuevo");
if($conn -> connect_error){
    die("Error de conexion");
}else{
    echo("Conexion exitosa");
}

?>