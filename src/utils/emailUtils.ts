import { supabase } from "@/integrations/supabase/client";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    throw error;
  }
};

export const sendTaskAssignmentEmail = async (
  email: string, 
  assigneeName: string, 
  taskTitle: string,
  taskType: "recurring" | "cleaning"
) => {
  const subject = `Nueva tarea asignada: ${taskTitle}`;
  const html = `
    <h1>Hola ${assigneeName},</h1>
    <p>Se te ha asignado una nueva tarea ${taskType === "recurring" ? "periódica" : "de aseo"}:</p>
    <h2>${taskTitle}</h2>
    <p>Por favor, revisa la aplicación para más detalles.</p>
  `;

  return sendEmail(email, subject, html);
};

export const sendBillDueEmail = async (
  email: string,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number
) => {
  const subject = `Factura próxima a vencer: ${billTitle}`;
  const html = `
    <h1>Hola ${userName},</h1>
    <p>La siguiente factura está próxima a vencer:</p>
    <h2>${billTitle}</h2>
    <p>Monto: $${amount}</p>
    <p>Fecha de vencimiento: ${dueDate}</p>
    <p>Por favor, asegúrate de realizar el pago antes de la fecha de vencimiento.</p>
  `;

  return sendEmail(email, subject, html);
};