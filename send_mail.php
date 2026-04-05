<?php
// ============================================================
//  send_mail.php — Амаре Групп
//  Принимает POST с формы, отправляет письмо через VK Workspace
// ============================================================

header('Content-Type: application/json; charset=utf-8');

// ---------- Только POST ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---------- Читаем данные ----------
$body = file_get_contents('php://input');
$data = json_decode($body, true);

$email   = isset($data['email'])   ? trim($data['email'])   : '';
$message = isset($data['message']) ? trim($data['message']) : '';

// ---------- Валидация ----------
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid email']);
    exit;
}
if (!$message) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Empty message']);
    exit;
}

// ---------- Настройки SMTP (VK Workspace / mail.ru) ----------
$smtp_host = 'smtp.mail.ru';
$smtp_port = 465;          // SSL
$smtp_user = 'orders@amaregrupp.ru';
$smtp_pass = 'pfrfpfnm12';
$from_name = 'Амаре Групп — Сайт';

// ---------- Отправляем через сокет (без PHPMailer) ----------
function smtp_send($host, $port, $user, $pass, $from, $from_name, $to, $subject, $body_text) {

    // Открываем SSL-соединение
    $context = stream_context_create([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
        ]
    ]);

    $socket = @stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        return ['ok' => false, 'error' => "Connection failed: {$errstr} ({$errno})"];
    }

    // Хелпер: читаем ответ сервера
    $read = function() use ($socket) {
        $resp = '';
        while ($line = fgets($socket, 515)) {
            $resp .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $resp;
    };

    // Хелпер: отправляем команду
    $cmd = function($command) use ($socket, $read) {
        fwrite($socket, $command . "\r\n");
        return $read();
    };

    $read(); // Приветствие

    $cmd("EHLO " . gethostname());
    $cmd("AUTH LOGIN");
    $cmd(base64_encode($user));
    $r = $cmd(base64_encode($pass));

    if (strpos($r, '235') === false) {
        fclose($socket);
        return ['ok' => false, 'error' => 'Auth failed: ' . trim($r)];
    }

    $cmd("MAIL FROM:<{$from}>");
    $cmd("RCPT TO:<{$to}>");
    $cmd("DATA");

    // Формируем письмо
    $date    = date('r');
    $subject_encoded = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $from_encoded    = '=?UTF-8?B?' . base64_encode($from_name) . '?=';

    $headers  = "Date: {$date}\r\n";
    $headers .= "From: {$from_encoded} <{$from}>\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    $headers .= "To: <{$to}>\r\n";
    $headers .= "Subject: {$subject_encoded}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";

    $body_b64 = chunk_split(base64_encode($body_text));

    $r = $cmd($headers . "\r\n" . $body_b64 . "\r\n.");

    $cmd("QUIT");
    fclose($socket);

    if (strpos($r, '250') === false) {
        return ['ok' => false, 'error' => 'Send failed: ' . trim($r)];
    }

    return ['ok' => true];
}

// ---------- Формируем письмо ----------
$subject = 'Новое сообщение с сайта amaregrupp.ru';

$body = "Новое сообщение с сайта Амаре Групп\n";
$body .= str_repeat('─', 40) . "\n\n";
$body .= "От кого: {$email}\n";
$body .= "Дата:    " . date('d.m.Y H:i') . "\n\n";
$body .= "Сообщение:\n{$message}\n\n";
$body .= str_repeat('─', 40) . "\n";
$body .= "Ответьте на это письмо — ответ придёт напрямую клиенту ({$email})";

// ---------- Отправляем ----------
$result = smtp_send(
    $smtp_host,
    $smtp_port,
    $smtp_user,
    $smtp_pass,
    $smtp_user,      // from
    $from_name,
    $smtp_user,      // to (orders@amaregrupp.ru)
    $subject,
    $body
);

if ($result['ok']) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $result['error']]);
}
