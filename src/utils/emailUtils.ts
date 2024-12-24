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

export const sendEmail = async (to: string | null | undefined, subject: string, html: string) => {
  // Si no hay dirección de correo, retornamos sin error
  if (!to) {
    console.log('No email address provided, skipping email send');
    return;
  }

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
  email: string | null | undefined, 
  assigneeName: string, 
  taskTitle: string,
  taskType: "recurring" | "cleaning",
  scheduleText?: string,
  notificationTime?: string
) => {
  // Si no hay email, retornamos sin error
  if (!email) {
    console.log(`No email address for ${assigneeName}, skipping notification`);
    return;
  }

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
  email: string | null | undefined,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number,
  isOverdue: boolean = false
) => {
  // Si no hay email, retornamos sin error
  if (!email) {
    console.log(`No email address for ${userName}, skipping bill notification`);
    return;
  }

  const subject = isOverdue ? 
    `¡Factura vencida!: ${billTitle}` : 
    `Factura próxima a vencer: ${billTitle}`;

  const message = isOverdue ?
    "La siguiente factura se encuentra vencida:" :
    "La siguiente factura está próxima a vencer:";

  const actionMessage = isOverdue ?
    "Por favor, realiza el pago lo antes posible para evitar recargos." :
    "Por favor, asegúrate de realizar el pago antes de la fecha de vencimiento.";

  const html = `
    <h1>Hola ${userName},</h1>
    <p>${message}</p>
    <h2>${billTitle}</h2>
    <p>Monto: $${amount}</p>
    <p>Fecha de vencimiento: ${dueDate}</p>
    <p>${actionMessage}</p>
  `;

  return sendEmail(email, subject, html);
};