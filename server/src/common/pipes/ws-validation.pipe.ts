import {
  Injectable,
  ArgumentMetadata,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
