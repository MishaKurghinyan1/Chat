import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'Id of the sender',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  senderId: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, bro, how are you?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Id of the chat',
    example: '987e6543-e21b-12d3-a456-426614174111',
  })
  @IsUUID()
  chatId: string;
}
