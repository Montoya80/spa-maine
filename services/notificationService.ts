
import { Appointment, Patient, BusinessConfig, Employee } from '../types';

export const cleanPhone = (phone: string) => {
  return phone.replace(/\D/g, '');
};

export const generateWhatsAppLink = (phone: string, message: string) => {
  const cleanNumber = cleanPhone(phone);
  // Assuming Mexico (52) if no country code provided.
  let finalNumber = cleanNumber;
  if (cleanNumber.length === 10) {
      finalNumber = `521${cleanNumber}`;
  }
  return `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
};

export const generateMailtoLink = (email: string, subject: string, body: string) => {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const getQuickMessage = (type: 'reminder' | 'promo' | 'general' | 'staff', name: string) => {
  const greeting = `Hola ${name.split(' ')[0]}`;
  
  switch (type) {
      case 'reminder':
          return `${greeting}, te saludamos de Maine SPA para recordarte tu próxima visita. ¿Podrías confirmarnos tu asistencia?`;
      case 'promo':
          return `${greeting}, ¡tenemos una promoción especial pensada para ti! 🎁 ¿Te gustaría conocer los detalles?`;
      case 'general':
          return `${greeting}, esperamos que estés teniendo un excelente día. Estamos a tus órdenes para cualquier consulta.`;
      case 'staff':
          return `${greeting}, aviso importante de la administración. Por favor confirma de recibido.`;
      default:
          return `${greeting}, gracias por contactar a Maine SPA.`;
  }
};

export const getStatusMessage = (type: 'confirmed' | 'cancelled' | 'rescheduled', appointment: Appointment, patient: Patient) => {
  const greeting = `Hola ${patient.fullName.split(' ')[0]},`;
  
  switch (type) {
    case 'confirmed':
      return {
        whatsapp: `${greeting} tu cita en Maine SPA Center está *CONFIRMADA*. 
🗓 Fecha: ${appointment.date}
⏰ Hora: ${appointment.time}
💆‍♀️ Tratamiento: ${appointment.service}
📍 Ubicación: Calle Ardilla #93, Col. Benito Juarez.
¡Te esperamos!`,
        emailSubject: 'Confirmación de Cita - Maine SPA Center',
        emailBody: `${greeting}\n\nTu cita ha sido confirmada exitosamente.\n\nDetalles:\nTratamiento: ${appointment.service}\nFecha: ${appointment.date}\nHora: ${appointment.time}\n\nRecuerda llegar 10 minutos antes.\n\nAtentamente,\nMaine SPA Center`
      };
    
    case 'cancelled':
      return {
        whatsapp: `${greeting} te informamos que tu cita para el ${appointment.date} ha sido *CANCELADA*. Si deseas reagendar, por favor contáctanos.`,
        emailSubject: 'Cancelación de Cita - Maine SPA Center',
        emailBody: `${greeting}\n\nTe informamos que tu cita programada para el ${appointment.date} a las ${appointment.time} ha sido cancelada.\n\nSi esto es un error o deseas reagendar, por favor responde a este correo o contáctanos por WhatsApp.\n\nAtentamente,\nMaine SPA Center`
      };

    case 'rescheduled':
      return {
        whatsapp: `${greeting} tu cita ha sido *REAGENDADA* exitosamente.
🗓 Nueva Fecha: ${appointment.date}
⏰ Nueva Hora: ${appointment.time}
¡Gracias por tu preferencia!`,
        emailSubject: 'Cambio de Horario de Cita - Maine SPA Center',
        emailBody: `${greeting}\n\nTu cita ha sido actualizada con el nuevo horario:\n\nFecha: ${appointment.date}\nHora: ${appointment.time}\n\nSi tienes alguna duda, contáctanos.\n\nAtentamente,\nMaine SPA Center`
      };
      
    default:
      return { whatsapp: '', emailSubject: '', emailBody: '' };
  }
};

export const getPasswordRecoveryMessage = (user: Patient | Employee) => {
  const greeting = `Hola ${user.fullName.split(' ')[0]},`;
  const password = user.password || 'No asignada';
  
  return {
    whatsapp: `${greeting} recibimos una solicitud para recordar tu contraseña de acceso a Maine SPA Center.
🔑 Tu contraseña es: *${password}*
Por favor, bórrala de este chat una vez la hayas memorizado por seguridad.`,
    emailSubject: 'Recuperación de Contraseña - Maine SPA Center',
    emailBody: `${greeting}\n\nHemos recibido una solicitud para recuperar tu acceso al sistema.\n\nTu contraseña actual es: ${password}\n\nTe recomendamos cambiarla periódicamente.\n\nSi no solicitaste esto, por favor contáctanos inmediatamente.\n\nAtentamente,\nMaine SPA Center`
  };
};

export const getPaymentInfoMessage = (
    patient: Patient, 
    bankingInfo: BusinessConfig['bankingInfo'], 
    totalAmount: number, 
    depositAmount: number,
    isNewClient: boolean,
    serviceName: string,
    discountPercent?: number
) => {
    const greeting = `Hola ${patient.fullName.split(' ')[0]},`;
    if (!bankingInfo) return { whatsapp: '', emailSubject: '', emailBody: '' };

    // Format money
    const formatMoney = (amount: number) => `$${amount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

    let priceDetails = `💆‍♀️ *Servicio:* ${serviceName}\n💰 *Total:* ${formatMoney(totalAmount)}`;
    
    if (discountPercent && discountPercent > 0) {
        priceDetails += ` (Incluye ${discountPercent}% de descuento)`;
    }

    let instructionText = "";

    if (isNewClient) {
        instructionText = `
⚠️ *ANTICIPO REQUERIDO (25%)*:
Para confirmar tu cita por ser primera vez, es necesario un anticipo de *${formatMoney(depositAmount)}*.
🛑 *Importante:* Si el pago no se confirma al menos *1 hora antes de la cita*, esta será cancelada automáticamente.
El resto (${formatMoney(totalAmount - depositAmount)}) se liquida el día de tu cita.`;
    } else {
        instructionText = `
✅ *Pago Total*: Puedes liquidar el total de *${formatMoney(totalAmount)}* ahora o pagar en sitio el día de tu cita.`;
    }

    const bankDetails = `
🏦 *Datos Bancarios*:
Banco: ${bankingInfo.bankName}
Cuenta: ${bankingInfo.accountNumber}
CLABE: ${bankingInfo.clabe}
Titular: ${bankingInfo.accountHolder}

📌 *CONCEPTO DE PAGO*: Abono ${patient.clientCode}
(Usa este concepto exacto para referencia automática)`;

    return {
        whatsapp: `${greeting} aquí tienes los detalles de pago para tu cita.

${priceDetails}
${instructionText}

${bankDetails}

Envíanos tu comprobante por aquí. ¡Gracias!`,
        emailSubject: 'Información de Pago - Maine SPA Center',
        emailBody: `${greeting}\n\nGracias por elegir Maine SPA Center. Aquí están los detalles para tu pago:\n\nServicio: ${serviceName}\nTotal a Pagar: ${formatMoney(totalAmount)}${discountPercent ? ` (con ${discountPercent}% descuento)` : ''}\n\n${isNewClient ? `ANTICIPO REQUERIDO (25%): ${formatMoney(depositAmount)}\nNota: Se requiere confirmación 1 hora antes de la cita para evitar cancelación.` : 'Puedes pagar por transferencia o en sitio.'}\n\nDATOS BANCARIOS:\nBanco: ${bankingInfo.bankName}\nCuenta: ${bankingInfo.accountNumber}\nCLABE: ${bankingInfo.clabe}\nTitular: ${bankingInfo.accountHolder}\n\nCONCEPTO: Abono ${patient.clientCode}\n\nAtentamente,\nMaine SPA Center`
    };
};
