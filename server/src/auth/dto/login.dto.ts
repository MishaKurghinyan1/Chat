import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: 'The email of the user',
    example: 'tBm0u@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
    minLength: 6,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;
}
