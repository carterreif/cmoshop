$Hso = New-Object Net.HttpListener
$Hso.Prefixes.Add("http://localhost:8000/")
$Hso.Start()
Write-Host "Server started at http://localhost:8000/"

while ($Hso.IsListening) {
    $HC = $Hso.GetContext()
    $HRes = $HC.Response
    $path = Join-Path (Get-Location) ($HC.Request.RawUrl -replace "^/")
    
    if ([System.IO.File]::Exists($path)) {
        $content = [System.IO.File]::ReadAllBytes($path)
        $HRes.ContentType = "text/html"
        $HRes.ContentLength64 = $content.Length
        $HRes.OutputStream.Write($content, 0, $content.Length)
    } else {
        $HRes.StatusCode = 404
    }
    
    $HRes.Close()
}
