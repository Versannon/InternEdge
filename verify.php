<?php
session_start();
include 'db.php';

$email = $_GET['email'];
$popupType = '';
$popupTitle = '';
$popupMessage = '';
$popupRedirect = null;

if(isset($_POST['verify'])){

    $entered_otp = $_POST['otp'];

    $check = "SELECT * FROM students WHERE email='$email'";
    $result = mysqli_query($conn, $check);
    $user = mysqli_fetch_assoc($result);

    if($entered_otp == $user['otp']){

        $update = "UPDATE students SET verified=1 WHERE email='$email'";
        mysqli_query($conn, $update);

        $_SESSION['student_id'] = $user['id'];
        $_SESSION['student_name'] = $user['fullname'];

        $popupType = 'success';
        $popupTitle = 'OTP Verified';
        $popupMessage = 'Account created successfully!';
        $popupRedirect = 'dashboard.php';

    } else {

        $popupType = 'error';
        $popupTitle = 'Verification Failed';
        $popupMessage = 'Invalid OTP. Please try again.';

    }
}
?>

<!DOCTYPE html>

<html>
<head>
    <title>Verify OTP</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="otp-container">
    <div class="otp-box">
        <h1>Email Verification</h1>
        <p>Enter your OTP</p>

    <form method="POST">
        <input type="text" name="otp" placeholder="Enter OTP" required>
        <button type="submit" name="verify">Verify</button>
    </form>
</div>

</div>

<div id="popupModal" class="popup-modal">
    <div class="popup-box">
        <div class="popup-icon" id="popupIcon"></div>
        <h2 id="popupTitle"></h2>
        <p id="popupMessage"></p>
    </div>
</div>

<script src="script.js"></script>
<?php if($popupType != '') { ?>
<script>
    showPopup(
        <?php echo json_encode($popupType); ?>,
        <?php echo json_encode($popupTitle); ?>,
        <?php echo json_encode($popupMessage); ?>,
        <?php echo json_encode($popupRedirect); ?>
    );
</script>
<?php } ?>

</body>
</html>
