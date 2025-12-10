
import { api } from './api';

export const MANAGER_EMAIL = "matteo.vizzani@rematarlazzi.it";

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const sendEmailNotification = async (payload: EmailPayload): Promise<boolean> => {
  try {
    await api.sendNotification(payload.to, payload.subject, payload.body);
    return true;
  } catch (error) {
    console.error("Failed to send email notification", error);
    return false;
  }
};
