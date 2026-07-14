import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private dataSource: DataSource) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // bao loi neu token het han
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    // khi giai ma thanh cong
    async validate(payload: any) {
        const user = await this.dataSource.manager.findOne(User, {
            where: { id: payload.sub }
        });

        if (!user || user.status === 'locked') {
            throw new UnauthorizedException('Token hết hạn hoặc tài khoản đang bị khóa.');
        }

        if (payload.sessionId) {
            const session = await this.dataSource.manager.findOne(Session, {
                where: { id: payload.sessionId }
            });

            if (!session) {
                throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã bị đăng xuất ở nơi khác.');
            }
        }

        // gan vao req.user
        return {
            id: user.id,
            sessionId: payload.sessionId,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        };
    }
}