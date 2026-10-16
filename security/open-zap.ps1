$ErrorActionPreference = 'Stop'
$assessmentRoot = Split-Path $PSScriptRoot -Parent
$assessmentTools = Join-Path $assessmentRoot '.security-tools'
$assessmentJava = Join-Path $assessmentTools 'runtime\jdk-17.0.20.1+1-jre\bin\javaw.exe'
$assessmentJar = Join-Path $assessmentTools 'distribution\zap-2.17.0.jar'
$assessmentSession = Join-Path $PSScriptRoot 'reports\optical-viva-session.session'
$assessmentApiPath = Join-Path $assessmentTools 'zap-api.json'
if (!(Test-Path -LiteralPath $assessmentJava) -or !(Test-Path -LiteralPath $assessmentJar)) {
    throw 'The workspace ZAP installation is missing.'
}
if (Test-Path -LiteralPath $assessmentApiPath) {
    $assessmentApi = Get-Content -LiteralPath $assessmentApiPath -Raw | ConvertFrom-Json
    $assessmentRunning = $false
    try {
        $assessmentStatus = Invoke-RestMethod -Uri ($assessmentApi.base + '/JSON/core/view/version/?apikey=' + [Uri]::EscapeDataString($assessmentApi.key)) -TimeoutSec 3
        $assessmentRunning = [bool]$assessmentStatus.version
    } catch { }
    if ($assessmentRunning) {
        Invoke-RestMethod -Uri ($assessmentApi.base + '/JSON/core/action/shutdown/?apikey=' + [Uri]::EscapeDataString($assessmentApi.key)) -TimeoutSec 10 | Out-Null
        $assessmentPidPath = Join-Path $assessmentTools 'zap.pid'
        if (Test-Path -LiteralPath $assessmentPidPath) {
            $assessmentProcessId = [int](Get-Content -LiteralPath $assessmentPidPath)
            Wait-Process -Id $assessmentProcessId -Timeout 20 -ErrorAction SilentlyContinue
            if (Get-Process -Id $assessmentProcessId -ErrorAction SilentlyContinue) { throw 'ZAP is still closing. Try again shortly.' }
        }
    }
}
$assessmentArguments = @('-Xmx768m', '-jar', ('"' + $assessmentJar + '"'), '-dir', ('"' + (Join-Path $assessmentTools 'zap-home') + '"'), '-host', '127.0.0.1', '-port', '8091')
if (Test-Path -LiteralPath $assessmentSession) { $assessmentArguments += @('-session', ('"' + $assessmentSession + '"')) }
# This launcher is explicitly invoked to show the interactive ZAP desktop.
Start-Process -FilePath $assessmentJava -ArgumentList $assessmentArguments -WorkingDirectory (Join-Path $assessmentTools 'distribution') -WindowStyle Normal
