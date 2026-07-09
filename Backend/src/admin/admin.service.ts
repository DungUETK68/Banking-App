import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';

@Injectable()
export class AdminService {
    constructor(private dataSource: DataSource) { }

    async getAllUsers(page: number, limit: number, filters: any) {
        const queryBuilder = this.dataSource.manager.createQueryBuilder(User, 'user')
            .select(['user.id', 'user.fullName', 'user.email', 'user.role', 'user.status', 'user.createdAt']);

        if (filters.name) {
            queryBuilder.andWhere('user.fullName ILIKE :name', { name: `%${filters.name}%` });
        }
        if (filters.email) {
            queryBuilder.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
        }
        if (filters.role) {
            queryBuilder.andWhere('user.role = :role', { role: filters.role });
        }
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', { status: filters.status });
        }

        queryBuilder.orderBy('user.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

        const [users, total] = await queryBuilder.getManyAndCount();

        return {
            message: 'Lấy danh sách người dùng thành công',
            data: {
                items: users,
                meta: {
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit
                }
            }
        };
    }

    async updateUserStatus(userId: string, newStatus: UserStatus) {
        const user = await this.dataSource.manager.findOne(User, { where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        user.status = newStatus;
        await this.dataSource.manager.save(user);

        return {
            message: `Tài khoản đã được ${newStatus === UserStatus.ACTIVE ? 'mở khóa' : 'khóa'} thành công`,
            data: {
                id: user.id,
                status: user.status
            }
        };
    }
    async getLedgerEntries(page: number, limit: number, filters: any) {
        const queryBuilder = this.dataSource.manager.createQueryBuilder(LedgerEntry, 'ledger')
            .leftJoinAndSelect('ledger.account', 'account')
            .leftJoinAndSelect('ledger.transaction', 'transaction');

        if (filters.accountId) {
            queryBuilder.andWhere('account.id = :accountId', { accountId: filters.accountId });
        }
        if (filters.accountNumber) {
            queryBuilder.andWhere('account.accountNumber = :accountNumber', { accountNumber: filters.accountNumber });
        }
        if (filters.transactionId) {
            queryBuilder.andWhere('transaction.id = :transactionId', { transactionId: filters.transactionId });
        }
        if (filters.type) {
            queryBuilder.andWhere('ledger.type = :type', { type: filters.type });
        }

        queryBuilder.orderBy('ledger.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

        const [entries, total] = await queryBuilder.getManyAndCount();

        return {
            message: 'Lấy danh sách bút toán thành công',
            data: {
                items: entries,
                meta: {
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit
                }
            }
        };
    }
}
