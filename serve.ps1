param(
  [int]$Port = 4173,
  [string]$Root = (Get-Location).Path
)

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".webmanifest" { return "application/manifest+json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    default { return "application/octet-stream" }
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Output "RastroCaza server listening on http://localhost:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()

    try {
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $client.Close()
        continue
      }

      while ($reader.Peek() -ge 0) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($line)) {
          break
        }
      }

      $parts = $requestLine.Split(" ")
      $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
      $relativePath = [System.Uri]::UnescapeDataString($rawPath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
      }

      $targetPath = Join-Path $Root $relativePath
      if ((Test-Path $targetPath) -and -not (Get-Item $targetPath).PSIsContainer) {
        $bytes = [System.IO.File]::ReadAllBytes($targetPath)
        $headers = @(
          "HTTP/1.1 200 OK",
          "Content-Type: $(Get-ContentType $targetPath)",
          "Content-Length: $($bytes.Length)",
          "Connection: close",
          ""
        ) -join "`r`n"

        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes("$headers`r`n")
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($bytes, 0, $bytes.Length)
      } else {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes("404")
        $headers = @(
          "HTTP/1.1 404 Not Found",
          "Content-Type: text/plain; charset=utf-8",
          "Content-Length: $($bodyBytes.Length)",
          "Connection: close",
          ""
        ) -join "`r`n"

        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes("$headers`r`n")
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($bodyBytes, 0, $bodyBytes.Length)
      }
    } finally {
      $stream.Dispose()
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
