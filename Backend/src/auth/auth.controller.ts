import { Controller, Post, Body, UseGuards, Request, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(
        @Body() loginDto: LoginDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string
    ) {
        return this.authService.login(loginDto, ip, userAgent);
    }

    @Post('refresh')
    refreshToken(
        @Body() refreshDto: RefreshTokenDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string
    ) {
        return this.authService.refreshToken(refreshDto, ip, userAgent);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Request() req) {
        return this.authService.logout(req.user.sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
    }
}
