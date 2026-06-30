<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM students WHERE email='$email'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {

        $user = mysqli_fetch_assoc($result);

        // Check password
        if (password_verify($password, $user['password'])) {

            // Check email verification
            if ($user['verified'] == 1) {

                $_SESSION['student_id'] = $user['id'];
                $_SESSION['student_name'] = $user['fullname'];

                echo "
                <script src='script.js'></script>
                <script>
                    showPopup(
                        'success',
                        'Login Successful',
                        'Redirecting to dashboard...',
                        'dashboard.php'
                    );
                </script>
                ";

            } else {

                echo "
                <script src='script.js'></script>
                <script>
                    showPopup(
                        'error',
                        'Verification Required',
                        'Please verify your email first.'
                    );
                </script>
                ";

            }

        } else {

            echo "
            <script src='script.js'></script>
            <script>
                showPopup(
                    'error',
                    'Login Failed',
                    'Incorrect password.'
                );
            </script>
            ";

        }

    } else {

        echo "
        <script src='script.js'></script>
        <script>
            showPopup(
                'error',
                'Login Failed',
                'Email not found.'
            );
        </script>
        ";

    }
}
?>
