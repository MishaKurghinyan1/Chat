import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { MessageDto } from '../../message/dto/message.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'The name of the chat',
    example: 'My Chat',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(4)
  name: string;

  @IsUUID()
  user_id: string;

  @Type(() => MessageDto)
  messages?: MessageDto[];
}
