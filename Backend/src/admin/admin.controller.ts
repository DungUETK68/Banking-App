import { Controller, Get, Patch, Delete, Param, Body, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    getAllUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('name') name?: string,
        @Query('email') email?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
    ) {
        return this.adminService.getAllUsers(Number(page), Number(limit),
            { name, email, role, status });
    }

    @Patch('users/:id/status')
    updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
        if (![UserStatus.ACTIVE, UserStatus.LOCKED].includes(status)) {
            throw new BadRequestException('Trạng thái không hợp lệ');
        }

        return this.adminService.updateUserStatus(id, status);
    }

    @Patch('users/:id/unflag')
    unflagUser(@Param('id') id: string) {
        return this.adminService.unflagUser(id);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Get('test-delete-ledger')
    async testDeleteLedger() {
        try {
            return await this.adminService.testDeleteLedger();
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('audit-logs')
    async getAuditLogs(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        return this.adminService.getAuditLogs(Number(page), Number(limit));
    }

    @Get('ledger-entries')
    getLedgerEntries(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('accountId') accountId?: string,
        @Query('accountNumber') accountNumber?: string,
        @Query('transactionId') transactionId?: string,
        @Query('type') type?: string,
    ) {
        return this.adminService.getLedgerEntries(Number(page), Number(limit), {
            accountId,
            accountNumber,
            transactionId,
            type,
        });
    }

    @Get('users/:id/history')
    getUserHistory(@Param('id') id: string) {
        return this.adminService.getUserHistory(id);
    }

    @Get('transactions')
    getAllTransactions(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('transactionId') transactionId?: string,
    ) {
        return this.adminService.getAllTransactions(Number(page), Number(limit), {
            type, status, transactionId
        });
    }
}
