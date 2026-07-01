<?php
session_start();

if (!isset($_SESSION['company_id'])) {
    header("Location: index.html");
    exit();
}
?>

<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Dashboard</title>
</head>
<body>


<h1>Welcome <?php echo $_SESSION['company_name']; ?></h1>

<a href="company-logout.php">Logout</a>


</body>
</html>
