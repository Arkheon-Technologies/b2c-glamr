import { IsIn } from 'class-validator';

export class UpdateQueueStatusDto {
  @IsIn(['waiting', 'notified', 'serving', 'served', 'cancelled', 'no_show'])
  status!: 'waiting' | 'notified' | 'serving' | 'served' | 'cancelled' | 'no_show';
}