import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Account } from '../../accounts/entities/account.entity';
import { Transaction } from './transaction.entity';

export enum LedgerEntryType {
    DEBIT = 'DEBIT', // bi tru tien
    CREDIT = 'CREDIT', // duoc cong tien
    INITIAL_BALANCE = 'INITIAL_BALANCE'
}

@Entity('ledger-entries')
export class LedgerEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @ManyToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @Column({ type: 'enum', enum: LedgerEntryType })
    type: LedgerEntryType;

    @Column({ type: 'numeric', precision: 18, scale: 2 })
    amount: number;

    @Column({ name: 'balance_after', type: 'numeric', precision: 18, scale: 2 })
    balanceAfter: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}