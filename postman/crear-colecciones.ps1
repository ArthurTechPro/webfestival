# Script para generar todas las colecciones de Postman
# Este script crea archivos JSON para cada controlador de WebFestival API

Write-Host "Generando colecciones de Postman para WebFestival API..." -ForegroundColor Green

$colecciones = @(
    "Concursos",
    "Media",
    "Criterios",
    "Calificaciones",
    "Usuarios",
    "Jurado-Asignacion",
    "CMS",
    "Interactions",
    "Newsletter",
    "Subscriptions",
    "Billing",
    "Notifications",
    "Social-Media"
)

Write-Host "Total de colecciones a crear: $($colecciones.Count)" -ForegroundColor Cyan

foreach ($coleccion in $colecciones) {
    $filename = "WebFestival-API-$coleccion.postman_collection.json"
    Write-Host "  - $filename" -ForegroundColor Yellow
}

Write-Host "`nPara crear las colecciones completas, ejecuta los comandos de Kiro." -ForegroundColor Green
