<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set("display_errors", 1);

$apiKey = "b538a6da2223eca6981a97c1bed984c8";
$baseUrl = "https://api.themoviedb.org/3/";

if (isset($_GET['query']) && !empty($_GET['query'])) {
    $query = urlencode($_GET['query']);
    $url = "{$baseUrl}search/movie?api_key={$apiKey}&query={$query}&include_adult=false&language=en-US&page=1";
} else {
    $url = "{$baseUrl}discover/movie?api_key={$apiKey}&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => ["accept: application/json"],
    CURLOPT_SSL_VERIFYPEER => false
]);

$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

$data = json_decode($response, true);
$filteredMovies = [];

if (isset($data['results']) && is_array($data['results'])) {
    foreach ($data['results'] as $movie) {
        $filteredMovies[] = [
            "title" => $movie["title"] ?? "Unknown",
            "release_date" => $movie["release_date"] ?? "N/A"
        ];
    }
}

echo json_encode(["results" => $filteredMovies]);

