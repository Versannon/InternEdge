<?php
include 'db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $company_name = $_POST['company_name'];
    $email = $_POST['email'];
    $contact = $_POST['contact'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $industry_type = $_POST['industry_type'];
    $company_size = $_POST['company_size'];
    $founded_year = $_POST['founded_year'];
    $website = $_POST['website'];
    $description = $_POST['description'];
    $country = $_POST['country'];
    $state = $_POST['state'];
    $city = $_POST['city'];
    $full_address = $_POST['full_address'];
    $pin_code = $_POST['pin_code'];

    if ($password != $confirm_password) {
        die("Passwords do not match.");
    }

    $checkEmail = "SELECT * FROM companies WHERE email='$email'";
    $result = mysqli_query($conn, $checkEmail);

    if (mysqli_num_rows($result) > 0) {
        die("This company email is already registered.");
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $otp = rand(100000,999999);

    $sql = "INSERT INTO companies
    (company_name,email,contact,password,industry_type,company_size,founded_year,website,description,country,state,city,full_address,pin_code,otp)
    VALUES
    ('$company_name','$email','$contact','$hashed_password','$industry_type','$company_size','$founded_year','$website','$description','$country','$state','$city','$full_address','$pin_code','$otp')";

    if(mysqli_query($conn,$sql)){

        $mail = new PHPMailer(true);

        try{
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;

            $mail->Username = 'kakadiyasuprince@gmail.com';
            $mail->Password = 'jekb cfdp hqpz eznd';

            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('YOUR_GMAIL@gmail.com', 'InternEdge');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Company OTP Verification';
            $mail->Body = "
                <h2>Welcome to InternEdge</h2>
                <p>Your Company Verification OTP:</p>
                <h1>$otp</h1>
            ";

            $mail->send();

            $verifyUrl = 'company-verify.php?email=' . urlencode($email);
            echo "
            <script src='script.js'></script>
            <script>
                showPopup(
                    'success',
                    'Registration Successful',
                    'Company registered successfully! Please enter the OTP sent to your email.',
                    " . json_encode($verifyUrl) . "
                );
            </script>
            ";
            exit();

        } catch (Exception $e){
            echo "Mail failed: " . $mail->ErrorInfo;
        }

    } else {
        echo "Database Error: " . mysqli_error($conn);
    }
}
?>
