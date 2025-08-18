import { ChatEntity } from 'src/chat/entities/chat.entity';
import { MessageEntity } from 'src/message/entites/messages.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  username: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('varchar', { length: 255, nullable: false, unique: true })
  email: string;

  @OneToMany(() => ChatEntity, (chat) => chat.user, { onDelete: 'CASCADE' })
  chat: ChatEntity[];

  @OneToMany(() => MessageEntity, (message) => message.sender, { onDelete: 'CASCADE' })
  messages: MessageEntity[];
}
