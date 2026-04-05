<?php
// ============================================================
//  save_products.php — Амаре Групп
//  Принимает POST с JSON продуктов, проверяет пароль, сохраняет
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: same-origin');

// ---------- Пароль ----------
define('ADMIN_PASSWORD', 'gfhjkm12eghfdktybt');

// ---------- Путь к файлу ----------
define('PRODUCTS_FILE', __DIR__ . '/products/products.json');

// ---------- Только POST ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---------- Читаем тело запроса ----------
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

// ---------- Проверяем пароль ----------
$password = isset($data['password']) ? $data['password'] : '';
if ($password !== ADMIN_PASSWORD) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Wrong password']);
    exit;
}

// ---------- Валидируем структуру ----------
if (!isset($data['products']) || !is_array($data['products'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing products array']);
    exit;
}

// Очищаем продукты (оставляем только нужные поля)
$clean = [];
foreach ($data['products'] as $p) {
    $clean[] = [
        'id'          => (int)  ($p['id']          ?? 0),
        'name'        => (string)($p['name']        ?? ''),
        'description' => (string)($p['description'] ?? ''),
        'image'       => (string)($p['image']       ?? ''),
        'featured'    => (bool)  ($p['featured']    ?? false),
        'link'        => (string)($p['link']        ?? '#'),
        'features'    => array_map('strval', (array)($p['features'] ?? [])),
    ];
}

// ---------- Сохраняем ----------
$json = json_encode(['products' => $clean], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Создаём папку если нет
$dir = dirname(PRODUCTS_FILE);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

if (file_put_contents(PRODUCTS_FILE, $json) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Cannot write file. Check folder permissions.']);
    exit;
}

echo json_encode(['ok' => true, 'saved' => count($clean)]);
