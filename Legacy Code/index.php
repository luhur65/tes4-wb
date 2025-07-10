<?php

// Konfigurasi Database
$host = "localhost";
$username = "root";
$password = "";
$database = "test";

// 1. Membuat koneksi database menggunakan mysqli
$mysqli = new mysqli($host, $username, $password, $database);

// Selalu periksa koneksi setelah membuatnya
if ($mysqli->connect_error) {
  die("Koneksi gagal: " . $mysqli->connect_error);
}

$status = 'active';
$today = date("Y-m-d");

// 2. Query menggunakan placeholder (?) untuk prepared statement
$query = "SELECT username, email, last_login, email_verified FROM users WHERE status = ?";

// 3. Menyiapkan statement
$stmt = $mysqli->prepare($query);

if ($stmt === false) {
  die("Error preparing statement: " . $mysqli->error);
}

// 4. Bind parameter ke placeholder
// "s" berarti parameter adalah tipe data string
$stmt->bind_param("s", $status);

// 5. Eksekusi statement
$stmt->execute();

// 6. Ambil hasil query
$result = $stmt->get_result();

$userCount = 0;
$emails = [];

// 7. Fetch data menggunakan fetch_assoc()
while ($row = $result->fetch_assoc()) {
  // Hanya user yang login dalam waktu 90 hari terakhir
  if (strtotime($row['last_login']) > strtotime("-90 days")) {
    if ($row['email_verified'] == 1) {
      $emails[] = $row['email'];
    }

    echo "Username: " . $row['username'] . "\n";
    echo "Email: " . $row['email'] . "\n";
    echo "Last Login: " . $row['last_login'] . "\n";
    echo "----------------------\n";

    $userCount++;
  }
}

echo "Total recent active users: $userCount\n";

// Simpan email untuk follow-up campaign
file_put_contents("emails.txt", implode("\n", $emails));

// 8. Selalu tutup statement dan koneksi
$stmt->close();
$mysqli->close();
