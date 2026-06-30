<?php
include 'db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $fullname = $_POST['fullname'];
    $email = $_POST['email'];
    $mobile = $_POST['mobile'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $dob = $_POST['dob'];
    $gender = $_POST['gender'];
    $college = $_POST['college'];
    $course = $_POST['course'];
    $semester = $_POST['semester'];
    $branch = $_POST['branch'];
    $graduation_year = $_POST['graduation_year'];
    $cgpa = $_POST['cgpa'];
    $skills = isset($_POST['skills']) ? $_POST['skills'] : "";
    $experience = $_POST['experience'];
    $portfolio = $_POST['portfolio'];
    $linkedin = $_POST['linkedin'];
    $github = $_POST['github'];

    // Password match chec
    if ($password != $confirm_password) {
        die("Passwords do not match.");
    }

    // Check duplicate email
    $checkEmail = "SELECT * FROM students WHERE email='$email'";
    $result = mysqli_query($conn, $checkEmail);

    if (mysqli_num_rows($result) > 0) {
        die("This email is already registered. Please login.");
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Resume Upload
    $resume = $_FILES['resume']['name'];
    $resume_tmp = $_FILES['resume']['tmp_name'];

    // Profile Upload
    $profile_pic = $_FILES['profile_pic']['name'];
    $profile_tmp = $_FILES['profile_pic']['tmp_name'];

    move_uploaded_file($resume_tmp, "uploads/" . $resume);
    move_uploaded_file($profile_tmp, "uploads/" . $profile_pic);

    // Generate OTP
    $otp = rand(100000, 999999);

    // Insert into DB
    $sql = "INSERT INTO students
    (fullname,email,mobile,password,dob,gender,college,course,semester,branch,graduation_year,cgpa,skills,experience,portfolio,linkedin,github,resume,profile_pic,otp)
    VALUES
    ('$fullname','$email','$mobile','$hashed_password','$dob','$gender','$college','$course','$semester','$branch','$graduation_year','$cgpa','$skills','$experience','$portfolio','$linkedin','$github','$resume','$profile_pic','$otp')";

    if (mysqli_query($conn, $sql)) {

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;

            // Your Gmail here
            $mail->Username = 'kakadiyasuprince@gmail.com';

            // Your App Password here
            $mail->Password = 'jekb cfdp hqpz eznd';

            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('yourgmail@gmail.com', 'InternEdge');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'InternEdge OTP Verification';
            $mail->Body = "
                <h2>Welcome to InternEdge</h2>
                <p>Your OTP for email verification is:</p>
                <h1>$otp</h1>
                <p>Do not share this OTP with anyone.</p>
            ";

            $mail->send();

            $verifyUrl = 'verify.php?email=' . urlencode($email);
            echo "
            <script src='script.js'></script>
            <script>
                showPopup(
                    'success',
                    'Registration Successful',
                    'Account created successfully! Please enter the OTP sent to your email.',
                    " . json_encode($verifyUrl) . "
                );
            </script>
            ";
            exit();

        } catch (Exception $e) {
            echo "OTP mail failed: " . $mail->ErrorInfo;
        }

    } else {
        echo "Database Error: " . mysqli_error($conn);
    }
}
?>
