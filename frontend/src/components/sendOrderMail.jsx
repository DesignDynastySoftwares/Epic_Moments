import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_zg6y8gd';
const TEMPLATE_ID = 'template_j91fgke';
const PUBLIC_KEY = 'c3EZ_n2Z8vJBCYjKG';

const sendOrderMail = async ({ items, address, amount }) => {
  try {
    if (!items || !items.length) return; // nothing to send

    const itemsRows = items.map(item => `
      ${item.name}
      ${item.quantity}
      ${item.size || 'FREE SIZE'}
    `).join('');

    const fullAddress = `${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.zipcode || ''}, ${address.country || ''}`;

    const emailParams = {
      name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
      email: address.email || '',
      phone: address.phone || '',
      address: fullAddress,
      amount: amount || 0,
      items: itemsRows,
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY);
  } catch {
    // Email is optional — order placed even if email fails
    // Fix: reconnect Gmail in EmailJS dashboard → https://dashboard.emailjs.com/admin/services
  }
};

export default sendOrderMail;
