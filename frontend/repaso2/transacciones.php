<?php
include "conexion.php";

if ($_POST) {

    $cuenta = $_POST['cuenta'];
    $tipo   = $_POST['tipo'];
    $monto  = $_POST['monto'];

    // Verificar si la cuenta existe
    $res = $conn->query("SELECT saldo FROM cuentas WHERE id_cue = '$cuenta'");

    if ($res->num_rows == 0) {
        $error = "❌ La cuenta no existe";
    } else {

        $c = $res->fetch_assoc();
        $saldo = $c['saldo'];

        // Validar retiro
        if ($tipo == "retiro" && $saldo < $monto) {
            $error = "❌ Saldo insuficiente";
        } else {

            // Calcular nuevo saldo
            $nuevosaldo = ($tipo == "deposito")
                ? $saldo + $monto
                : $saldo - $monto;

            // Actualizar cuenta
            $conn->query("UPDATE cuentas SET saldo = '$nuevosaldo' WHERE id_cue = '$cuenta'");

            // Registrar transacción
            $conn->query("INSERT INTO transacciones VALUES (NULL,'$cuenta','$tipo','$monto')");

            $success = "✅ Transacción guardada exitosamente";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Transacciones</title>
</head>
<body>

<h1>Transacciones</h1>
<a href="index.php"><-</a>
<?php
if (isset($error)) {
    echo "<p style='color:red;'>$error</p>";
}

if (isset($success)) {
    echo "<p style='color:green;'>$success</p>";
}
?>

<form method="POST">
    Cuenta ID:
    <input type="number" name="cuenta" required><br><br>

    Tipo:
    <select name="tipo" required>
        <option value="">Seleccione</option>
        <option value="deposito">Depósito</option>
        <option value="retiro">Retiro</option>
    </select><br><br>

    Monto:
    <input type="number" name="monto" step="0.01" min="0.01" required><br><br>

    <button type="submit">Guardar</button>
</form>
<table border="1" cellpadding="5" cellspacing="0">
    <tr>
        <th>ID Transacción</th>
        <th>ID Cuenta</th>
        <th>Tipo</th>
        <th>Monto</th>
    </tr>
    <?php
    $transacciones = $conn->query("SELECT * FROM transacciones");
    while ($t = $transacciones->fetch_assoc()) {
        echo "<tr>
                <td>{$t['id_tra']}</td>
                <td>{$t['cuenta_id']}</td>
                <td>{$t['tipo']}</td>
                <td>{$t['monto']}</td>
              </tr>";
    }
    ?>

</body>
</html>
