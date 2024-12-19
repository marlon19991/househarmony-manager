import { supabase } from "@/integrations/supabase/client";

// Implement rate limiting using a simple queue
const queue: Array<() => Promise<any>> = [];
let processing = false;

const processQueue = async () => {
  if (processing || queue.length === 0) return;
  
  processing = true;
  const task = queue.shift();
  
  if (task) {
    try {
      await task();
    } catch (error) {
      console.error('Error processing email task:', error);
    }
    
    // Add delay between requests to respect rate limit
    setTimeout(() => {
      processing = false;
      processQueue();
    }, 500); // 500ms delay between requests
  } else {
    processing = false;
  }
};

const addToQueue = (task: () => Promise<any>) => {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  const task = async () => {
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
    } catch (error: any) {
      if (error?.message?.includes('rate_limit_exceeded')) {
        // If rate limited, retry after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return task(); // Retry the task
      }
      throw error;
    }
  };

  return addToQueue(task);
};

export const sendTaskAssignmentEmail = async (
  email: string, 
  assigneeName: string, 
  taskTitle: string,
  taskType: "recurring" | "cleaning",
  scheduleText?: string,
  notificationTime?: string
) => {
  const subject = taskType === "cleaning" ? 
    "¡Es tu turno para el Aseo General!" : 
    `Nueva tarea asignada: ${taskTitle}`;

  const cleaningHtml = `
    <h1>¡Hola ${assigneeName}!</h1>
    <p>Es tu turno para realizar el aseo general de la casa. 🏠✨</p>
    <p>Tu participación es muy importante para mantener un ambiente agradable y una buena convivencia entre todos.</p>
    <h2>¿Por qué es importante?</h2>
    <ul>
      <li>Mantenemos un espacio limpio y ordenado para todos</li>
      <li>Contribuimos a una mejor convivencia</li>
      <li>Creamos un ambiente más saludable y agradable</li>
    </ul>
    <p>Por favor, revisa la aplicación para ver la lista de tareas pendientes.</p>
    <p>¡Gracias por tu colaboración en mantener nuestro hogar en las mejores condiciones! 🙌</p>
  `;

  const regularHtml = `
    <h1>Hola ${assigneeName},</h1>
    <p>Se te ha asignado una nueva tarea:</p>
    <h2>${taskTitle}</h2>
    ${scheduleText ? `<p>Programación: ${scheduleText}</p>` : ''}
    ${notificationTime ? `<p>Hora de notificación: ${notificationTime}</p>` : ''}
    <p>Por favor, revisa la aplicación para más detalles.</p>
  `;

  const html = taskType === "cleaning" ? cleaningHtml : regularHtml;

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

export const sendBillOverdueEmail = async (
  email: string,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number
) => {
  const subject = `¡Factura vencida!: ${billTitle}`;
  const html = `
    <h1>Hola ${userName},</h1>
    <p>La siguiente factura se encuentra vencida:</p>
    <h2>${billTitle}</h2>
    <p>Monto: $${amount}</p>
    <p>Fecha de vencimiento: ${dueDate}</p>
    <p>Por favor, realiza el pago lo antes posible para evitar recargos.</p>
  `;

  return sendEmail(email, subject, html);
};