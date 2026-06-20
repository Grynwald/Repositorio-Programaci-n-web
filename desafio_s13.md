# Desafío Semana 13 - Mercado Pago Sandbox

## 1. Setup

- SDK instalado: `mercadopago` v3.1.0
- Credenciales sandbox configuradas en Vercel y `.env.local`
- Variables de entorno: `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, `NEXT_PUBLIC_SITE_URL`

## 2. API `/api/pagos/crear-preferencia`

- Recibe `orden_id` en el body
- Valida que la orden exista, pertenezca al usuario y esté en estado `pendiente`
- Llama al SDK de Mercado Pago con items, payer, back_urls y external_reference
- Retorna `init_point` (sandbox_init_point en modo sandbox)

## 3. Flujo de Pago

1. Usuario va a `/checkout?orden_id=X`
2. Ve el resumen de su orden
3. Hace click en "Pagar con Mercado Pago"
4. Es redirigido al checkout de Mercado Pago
5. Completa el pago con tarjeta de prueba
6. Es redirigido a `/pago-completado`, `/pago-fallido` o `/pago-pendiente`

## 4. Páginas de Resultado

- `/pago-completado` — muestra payment_id y número de orden
- `/pago-fallido` — muestra razones y opción de reintentar
- `/pago-pendiente` — informa que el pago está en proceso

## 5. Testing con Tarjetas de Prueba

| Escenario | Número | Titular | Resultado |
|---|---|---|---|
| Aprobado | 4111 1111 1111 1111 | APRO | Redirige a /pago-completado |
| Rechazado | 4111 1111 1111 1112 | OTHE | Redirige a /pago-fallido |
| Pendiente | 4111 1111 1111 1113 | PENDING | Redirige a /pago-pendiente |

Vencimiento: 11/25 | CVV: 123

## 6. Resultados

<!-- Completar después de testear -->
- [ ] Pago APROBADO: funciona correctamente
- [ ] Pago RECHAZADO: funciona correctamente  
- [ ] Pago PENDIENTE: funciona correctamente
