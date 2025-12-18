<?php
include "conexion.php";
$cuenta = $_POST['cuenta'];
$tipo = $_POST['tipo'];
$monto = $_POST['monto'];

$c = $conn ->query("SELECT saldo FROM cuentas WHERE id_cue = '$cuenta'") -> fetch_assoc();

$saldo = $c['saldo'];

if($tipo == "retiro" && $saldo < $monto){
    echo "<p style='color:red;'>❌ Saldo insuficiente</p>";
    echo "<a href='transacciones.php'>Volver</a>";
    exit;
}

$nuevosaldo = ($tipo == "deposito") 
    ? $saldo + $monto 
    : $saldo - $monto;

$conn -> query("UPDATE cuentas SET saldo = '$nuevosaldo' where id_cue= '$cuenta'");

$conn -> query("INSERT INTO transacciones values (NULL,'$cuenta','$tipo','$monto')");
header("Location: transacciones.php");
echo "<p style='color:green;'>✅ Transacción guardada exitosamente</p>";
exit;
?>