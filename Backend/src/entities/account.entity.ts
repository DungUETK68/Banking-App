import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { User } from './user.entity'
import { Transaction } from "./transaction.entity";

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'account_number', unique: true })
    accountNumber: string;

    @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
    balance: number;

    @Column({ default: 'VND' })
    currency: string;

    @CreateDateColumn({ name: 'created_date' })
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.accounts)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.fromAccount)
    sentTransactions: Transaction[];

    @OneToMany(() => Transaction, (transaction) => transaction.toAccount)
    receivedTransactions: Transaction[];
}