import { IsString, IsOptional, IsEmail, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
    phoneNumber?: string;
}
