<?php
session_start();
if(!isset($_SESSION['usuario'])){
    header("Location: login.php");
    exit;
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
    <h1>Menu principal  <?php echo isset($_SESSION['usuario']) ? $_SESSION['usuario'] : ''; ?></h1>
    <a href="registro.php">Registrar usuarios</a><br>
    <a href="transacciones.php">Realizar transacciones</a><br>
    <a href="consulta.php">Consulta</a><br>
    <a href="layout.php">Cerrar sesion</a>

</body>
</html>