import { sendEmail } from '@/lib/utils';

export interface EmailTask {
  to: string;
  subject: string;
  html: string;
  description?: string;
}

class EmailQueue {
  private queue: EmailTask[] = [];
  private isProcessing = false;

  public enqueue(task: EmailTask) {
    this.queue.push(task);
    // Trigger queue processing asynchronously
    void this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      try {
        await sendEmail(task.to, task.subject, task.html);
      } catch (err) {
        console.error(
          `[EmailQueue] Failed to send email to ${task.to} (${task.description || task.subject}):`,
          err
        );
      }
    }

    this.isProcessing = false;
  }
}

// Global singleton instance
const globalEmailQueue = new EmailQueue();

export function queueEmail(task: EmailTask) {
  globalEmailQueue.enqueue(task);
}
