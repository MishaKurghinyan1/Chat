import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';
import { UserEntity } from 'src/auth/entities/user.entity';

export const Authorizated = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request & { user: UserEntity };
    const user = request.user;
    return data ? user[data] : user;
  },
);