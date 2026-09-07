export class CreateNotificationDto {
  title: string;
  desc: string;
  type?: 'approval' | 'crm' | 'badge' | 'system' | 'meeting';
  userId?: number;
}
