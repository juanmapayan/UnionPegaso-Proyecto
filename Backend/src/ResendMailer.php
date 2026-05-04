<?php
// Backend/src/ResendMailer.php

class ResendMailer {

    public static function sendOrderConfirmation(array $order, array $items): void {
        $config = (require __DIR__ . '/../config/config.php')['resend'] ?? [];
        $apiKey = $config['api_key'] ?? '';

        if (empty($apiKey)) return;

        $fromAddress = $config['from_address'] ?? 'pedidos@unionpegaso.com';
        $fromName    = $config['from_name']    ?? 'Unión Pegaso';

        $toEmail = trim($order['email'] ?? '');
        if (empty($toEmail)) return;

        $nombre  = htmlspecialchars($order['nombre'] ?? '', ENT_QUOTES, 'UTF-8');
        $orderId = (int) ($order['id'] ?? 0);
        $total   = number_format((float) ($order['total'] ?? 0), 2, '.', ',');

        $itemsHtml = '';
        foreach ($items as $item) {
            $name  = htmlspecialchars($item['name_snapshot'] ?? '', ENT_QUOTES, 'UTF-8');
            $price = number_format((float) ($item['price_snapshot'] ?? 0), 2, '.', ',');
            $qty   = (int) ($item['quantity'] ?? 1);
            $itemsHtml .= "
            <tr>
              <td style='padding:8px 0;color:#d1d5db;'>{$name}</td>
              <td style='padding:8px 0;color:#d1d5db;text-align:center;'>{$qty}</td>
              <td style='padding:8px 0;color:#a78bfa;text-align:right;font-weight:600;'>€{$price}</td>
            </tr>";
        }

        $html = "<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='background:#080808;font-family:sans-serif;color:#e5e7eb;margin:0;padding:32px;'>
  <div style='max-width:560px;margin:0 auto;'>
    <h1 style='color:#a78bfa;font-size:22px;margin-bottom:4px;'>Unión Pegaso</h1>
    <h2 style='color:#fff;font-size:20px;margin-top:0;'>¡Tu pedido ha sido recibido!</h2>
    <p style='color:#9ca3af;line-height:1.7;'>
      Hola <strong style='color:#fff;'>{$nombre}</strong>, hemos recibido correctamente tu solicitud.
      Tu pedido está <strong style='color:#fbbf24;'>pendiente de confirmación</strong> y un miembro de nuestro
      equipo se pondrá en contacto contigo en las próximas <strong style='color:#fff;'>24-48 horas</strong>
      para gestionar el pago y los detalles.
    </p>

    <div style='background:#1a1a2e;border:1px solid rgba(124,58,237,0.3);border-radius:8px;padding:16px 20px;margin:20px 0;'>
      <p style='color:#a78bfa;font-weight:700;font-size:13px;letter-spacing:1px;margin:0 0 12px 0;'>PEDIDO #{$orderId}</p>
      <table width='100%' cellspacing='0' cellpadding='0'>
        <thead>
          <tr>
            <th style='text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid rgba(124,58,237,0.2);'>Servicio</th>
            <th style='text-align:center;color:#6b7280;font-size:11px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid rgba(124,58,237,0.2);'>Cant.</th>
            <th style='text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid rgba(124,58,237,0.2);'>Precio</th>
          </tr>
        </thead>
        <tbody>{$itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan='2' style='padding-top:12px;border-top:1px solid rgba(124,58,237,0.2);color:#fff;font-weight:700;'>Total</td>
            <td style='padding-top:12px;border-top:1px solid rgba(124,58,237,0.2);color:#a78bfa;font-weight:700;text-align:right;font-size:18px;'>€{$total}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p style='color:#9ca3af;line-height:1.7;'>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.</p>
    <p style='color:#4b5563;font-size:11px;border-top:1px solid #1f2937;padding-top:16px;margin-top:24px;'>
      © 2025 Unión Pegaso
    </p>
  </div>
</body>
</html>";

        $payload = json_encode([
            'from'    => "{$fromName} <{$fromAddress}>",
            'to'      => [$toEmail],
            'subject' => "Pedido #{$orderId} recibido — Unión Pegaso",
            'html'    => $html,
        ]);

        if ($payload === false) return;

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
