import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum ReconciliationStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED'
}

@Entity('reconciliation_reports')
export class ReconciliationReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'accountId' })
    account: Account;

    @Column()
    accountId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    expectedBalance: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    actualBalance: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    discrepancy: number;

    @Column({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.PENDING })
    status: ReconciliationStatus;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}