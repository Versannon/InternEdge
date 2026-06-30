<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM companies WHERE email='$email'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {

        $company = mysqli_fetch_assoc($result);

        // Check password
        if (password_verify($password, $company['password'])) {

            // Check email verification
            if ($company['verified'] == 1) {

                $_SESSION['company_id'] = $company['id'];
                $_SESSION['company_name'] = $company['company_name'];

                echo "
                <script src='script.js'></script>
                <script>
                    showPopup(
                        'success',
                        'Login Successful',
                        'Redirecting to company dashboard...',
                        'company-dashboard.php'
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
                        'Please verify your company email first.'
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
                'Company email not found.'
            );
        </script>
        ";

    }
}
?>
