import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
    constructor(private dataSource: DataSource,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, fullName } = registerDto;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingUser = await queryRunner.manager.findOne(User, { where: { email } });
            if (existingUser) {
                throw new ConflictException('Email này đã tồn tại.');
            }

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            const user = new User();
            user.email = email;
            user.fullName = fullName;
            user.passwordHash = passwordHash;
            const savedUser = await queryRunner.manager.save(user);

            const account = new Account();
            account.user = savedUser;
            account.accountNumber = Math.random().toString().slice(2, 12);
            await queryRunner.manager.save(account);

            await queryRunner.commitTransaction();

            return {
                message: 'Đăng ký tài khoản thành công.',
                userId: savedUser.id,
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (error instanceof ConflictException) {
                throw error;
            }

            throw new InternalServerErrorException('Đăng ký thất bại, vui lòng thử lại.');
        } finally {
            await queryRunner.release();
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        try {
            const user = await this.dataSource.manager.findOne(User, { where: { email } });
            if (!user) {
                throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
            }

            const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordMatch) {
                throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
            }

            if (user.status === 'locked') {
                throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
            }

            const tokens = await this.generateTokens(user);

            return {
                message: 'Đăng nhập thành công.',
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role
                    }
                }
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException('Lỗi trong quá trình đăng nhập, vui lòng thử lại.');
        }
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<any>('JWT_SECRET')!,
                expiresIn: this.configService.get<any>('JWT_EXPIRATION', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<any>('JWT_REFRESH_SECRET')!,
                expiresIn: this.configService.get<any>('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);

        const salt = await bcrypt.genSalt();
        const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

        await this.dataSource.manager.update(User, { id: user.id }, { refreshToken: refreshTokenHash });

        return {
            accessToken,
            refreshToken
        };
    }

    async refreshToken(refreshDto: RefreshTokenDto) {
        const { userId, refreshToken } = refreshDto;

        try {
            const user = await this.dataSource.manager.findOne(User, { where: { id: userId } });
            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Access Denied');
            }

            try {
                await this.jwtService.verifyAsync(refreshToken, {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET')!
                });
            } catch (error) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const isRefreshTokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isRefreshTokenMatch) {
                throw new UnauthorizedException('Access Denied');
            }

            const tokens = await this.generateTokens(user);

            return {
                message: 'Token refreshed successfully',
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException('System error. Please try again later.');
        }
    }
}
