import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../interfaces/jwt.interface";
import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor (private readonly authService: AuthService,
    configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            algorithms: ['HS256']
        })
    }
    async validate(payload: JwtPayload) {
        return await this.authService.validate(payload.id);
    }
}