import { Controller, Get, Patch, Param, Body, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserStatus } from '../entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
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
}
