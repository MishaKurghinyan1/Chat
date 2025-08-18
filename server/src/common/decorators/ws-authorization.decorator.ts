import { applyDecorators, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-auth.guard';

export function WsAuthorization() {
  return applyDecorators(UseGuards(WsJwtGuard));
}
