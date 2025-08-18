import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { UserEntity } from "src/auth/entities/user.entity";
import { ChatEntity } from "src/chat/entities/chat.entity";
import { MessageEntity } from "src/message/entites/messages.entity";
import { isDev } from "src/common/utils";

export function typeORMConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.getOrThrow<string>('DB_HOST') || 'localhost',
    port: configService.getOrThrow<number>('DB_PORT') || 3306,
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    entities: [MessageEntity, ChatEntity, UserEntity],
    synchronize: isDev(configService),
  };
}