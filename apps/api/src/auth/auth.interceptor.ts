import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import { User } from '@tickon/types';

interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data: AuthResponse) => {
        const isLogout = request.path?.includes('/logout');

        if (isLogout) {
          // Clear cookies on logout
          this.clearAuthCookies(response);
        } else if (data?.accessToken && data?.refreshToken) {
          // Set cookies on login/register/refresh
          this.setAuthCookies(response, data.refreshToken, data.accessToken);
        }

        return data;
      }),
    );
  }

  private setAuthCookies(
    res: Response,
    refreshToken: string,
    accessToken: string,
  ) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  private clearAuthCookies(res: Response) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }
}
