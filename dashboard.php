<?php
session_start();

if (!isset($_SESSION['student_id'])) {
    header("Location: index.html");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>

<h1>Welcome <?php echo $_SESSION['student_name']; ?></h1>

<a href="logout.php">Logout</a>

</body>
</html>