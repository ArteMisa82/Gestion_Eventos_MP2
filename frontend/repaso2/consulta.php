<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Consulta</title>
</head>
<body>

<form method="post">
     <ul><a href="login.php"> <- Login</a></ul>
    Cédula: <input type="text" name="cedula" required>
    <button type="submit">Consultar</button>
</form>

<?php
include "conexion.php";

if ($_POST) {
    $cedula = $_POST['cedula'];

    $sql = "
        SELECT 
            c.nombre,
            c.cedula,
            cu.id_cue AS cuenta,
            t.tipo,
            t.monto
            
        FROM clientes c
        JOIN cuentas cu ON c.id_cli = cu.cliente_id
        LEFT JOIN transacciones t ON cu.id_cue = t.cuenta_id
        WHERE c.cedula = '$cedula'
       
    ";
    ## t.fecha ORDER BY t.fechar

    $resultado = $conn->query($sql);

    if ($resultado->num_rows > 0) {
        $saldo = 0;
        $mostrado = false;

        echo "<h3>Datos del cliente</h3>";

        while ($fila = $resultado->fetch_assoc()) {

            if (!$mostrado) {
                echo "Nombre: {$fila['nombre']}<br>";
                echo "Cédula: {$fila['cedula']}<br>";
                echo "Cuenta #: {$fila['cuenta']}<br><br>";

                echo "<h3>Transacciones</h3>";
                echo "<table border='1'>
                        <tr>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                        </tr>";
                $mostrado = true;
            }

            if ($fila['tipo']) {
                echo "<tr>
                        <td>{$fila['tipo']}</td>
                        <td>{$fila['monto']}</td>
                        ##<td>{$fila['fechar']}</td>
                      </tr>";

                // Calcular saldo desde transacciones
                if ($fila['tipo'] == 'deposito') {
                    $saldo += $fila['monto'];
                } else {
                    $saldo -= $fila['monto'];
                }
            }
        }

        echo "</table>";
        echo "<br><strong>Saldo total: $saldo</strong>";

    } else {
        echo "Cliente no encontrado";
    }
}
?>

</body>
</html>



