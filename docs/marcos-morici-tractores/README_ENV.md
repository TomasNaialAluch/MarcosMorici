# Configuración de Variables de Entorno

El archivo `.env.local` ya está creado con las credenciales de Firebase configuradas.

## Variables Configuradas

✅ **Firebase** - Configurado y listo para usar
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
- Measurement ID (Analytics)

⚠️ **WhatsApp** - Necesitas actualizar:
- `NEXT_PUBLIC_WHATSAPP_NUMBER` - Tu número de WhatsApp (formato: código país + número)
- `NEXT_PUBLIC_WHATSAPP_MESSAGE` - Mensaje por defecto (opcional)

⚠️ **Site URL** - Actualizar cuando tengas el dominio:
- `NEXT_PUBLIC_SITE_URL` - URL de producción (actualmente localhost)

## Cómo obtener las credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Configuración del proyecto (ícono de engranaje)
4. En "Tus aplicaciones", selecciona la app web o crea una nueva
5. Copia los valores del objeto `firebaseConfig`

## Número de WhatsApp

- Formato: código de país + número (sin espacios ni guiones)
- Ejemplo para Argentina: `5491123456789`
- El mensaje por defecto se puede personalizar
