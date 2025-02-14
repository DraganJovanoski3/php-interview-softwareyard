<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set("display_errors", 1);

$apiKey = "b538a6da2223eca6981a97c1bed984c8"; 
$baseUrl = "https://api.themoviedb.org/3/";


$page = isset($_GET['page']) ? intval($_GET['page']) : 1;

if (isset($_GET['movie_id']) && !empty($_GET['movie_id'])) {
    $movieId = intval($_GET['movie_id']);
    $url = $baseUrl . "movie/{$movieId}?language=en-US&api_key={$apiKey}";
}
elseif (isset($_GET['query']) && !empty($_GET['query'])) {
    $query = urlencode($_GET['query']);
    $url = $baseUrl . "search/movie?api_key={$apiKey}&query={$query}&include_adult=false&language=en-US&page={$page}";
} 
else {
    $url = $baseUrl . "discover/movie?api_key={$apiKey}&include_adult=false&include_video=false&language=en-US&page={$page}&sort_by=popularity.desc";
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
        "accept: application/json"
    ],
    CURLOPT_SSL_VERIFYPEER => false
]);

$response = curl_exec($ch);
if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    curl_close($ch);
    echo json_encode(["error" => $error_msg]);
    exit;
}
curl_close($ch);
echo $response;
