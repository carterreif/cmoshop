<?php
if(isset($_POST['url'])) {
    $url = $_POST['url'];
    
    // Extract video ID from URL
    $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
    if(preg_match($pattern, $url, $matches)) {
        $video_id = $matches[1];
        
        // Get video info
        $video_info = file_get_contents("https://www.youtube.com/get_video_info?video_id=" . $video_id);
        parse_str($video_info, $video_data);
        
        if(isset($video_data['player_response'])) {
            $player_response = json_decode($video_data['player_response'], true);
            $formats = $player_response['streamingData']['formats'];
            
            // Get highest quality format
            $download_url = $formats[0]['url'];
            $title = $player_response['videoDetails']['title'];
            
            // Set headers for download
            header('Content-Type: video/mp4');
            header('Content-Disposition: attachment; filename="' . $title . '.mp4"');
            
            // Download the file
            readfile($download_url);
            exit();
        }
    }
    
    // If we get here, something went wrong
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Could not process video URL']);
    exit();
}
?>
