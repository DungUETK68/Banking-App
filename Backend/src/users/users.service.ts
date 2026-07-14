import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private dataSource: DataSource) { }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException('Người dùng không tồn tại');
            }

            if (updateProfileDto.email && updateProfileDto.email !== user.email) {
                const existingEmail = await queryRunner.manager.findOne(User, { where: { email: updateProfileDto.email } });
                if (existingEmail) throw new BadRequestException('Email đã được sử dụng');
                user.email = updateProfileDto.email;
            }

            if (updateProfileDto.phoneNumber && updateProfileDto.phoneNumber !== user.phoneNumber) {
                const existingPhone = await queryRunner.manager.findOne(User, { where: { phoneNumber: updateProfileDto.phoneNumber } });
                if (existingPhone) throw new BadRequestException('Số điện thoại đã được sử dụng');
                user.phoneNumber = updateProfileDto.phoneNumber;
            }

            if (updateProfileDto.fullName) {
                user.fullName = updateProfileDto.fullName;
            }

            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();

            return {
                message: 'Cập nhật thông tin thành công',
                data: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteAccount(userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
                relations: { accounts: true }
            });

            if (!user) {
                throw new NotFoundException('Người dùng không tồn tại');
            }

            if (user.accounts && user.accounts.length > 0) {
                await queryRunner.manager.softRemove(user.accounts);
            }

            await queryRunner.manager.softRemove(user);

            await queryRunner.commitTransaction();

            return {
                message: 'Xóa tài khoản thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
