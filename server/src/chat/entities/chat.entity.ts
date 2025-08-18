import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageEntity } from '../../message/entites/messages.entity';
import { UserEntity } from 'src/auth/entities/user.entity';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @OneToMany(() => MessageEntity, (message) => message.chat, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: MessageEntity[];

  @ManyToOne(() => UserEntity, (user) => user.chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
