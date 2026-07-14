import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private dataSource: DataSource) { }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.dataSource.manager.findOne(User, { where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingEmail = await this.dataSource.manager.findOne(User, { where: { email: updateProfileDto.email } });
            if (existingEmail) throw new BadRequestException('Email đã được sử dụng');
            user.email = updateProfileDto.email;
        }

        if (updateProfileDto.phoneNumber && updateProfileDto.phoneNumber !== user.phoneNumber) {
            const existingPhone = await this.dataSource.manager.findOne(User, { where: { phoneNumber: updateProfileDto.phoneNumber } });
            if (existingPhone) throw new BadRequestException('Số điện thoại đã được sử dụng');
            user.phoneNumber = updateProfileDto.phoneNumber;
        }

        if (updateProfileDto.fullName) {
            user.fullName = updateProfileDto.fullName;
        }

        await this.dataSource.manager.save(user);

        return {
            message: 'Cập nhật thông tin thành công',
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
        };
    }

    async deleteAccount(userId: string) {
        const user = await this.dataSource.manager.findOne(User, {
            where: { id: userId },
            relations: { accounts: true }
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        if (user.accounts && user.accounts.length > 0) {
            await this.dataSource.manager.softRemove(user.accounts);
        }

        await this.dataSource.manager.softRemove(user);

        return {
            message: 'Xóa tài khoản thành công'
        };
    }
}
