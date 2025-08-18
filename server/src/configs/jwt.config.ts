import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfigFactory = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  return {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      algorithm: 'HS256',
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    },
  };
};
