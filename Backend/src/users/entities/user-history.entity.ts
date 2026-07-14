import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_history')
export class UserHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'old_email', nullable: true })
    oldEmail: string;

    @Column({ name: 'old_phone_number', nullable: true })
    oldPhoneNumber: string;

    @Column({ name: 'old_full_name', nullable: true })
    oldFullName: string;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
