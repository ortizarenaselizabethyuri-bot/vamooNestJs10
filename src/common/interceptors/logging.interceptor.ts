import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor global para el registro y trazabilidad de peticiones HTTP en consola.
 *
 * Propósito: Visualizar en tiempo real en la terminal las solicitudes entrantes, su método, ruta,
 * tiempo de procesamiento en milisegundos y código de respuesta HTTP.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Intercepta la solicitud entrante y registra su ciclo de vida completo.
   *
   * @param context - Contexto de ejecución de NestJS.
   * @param next - Siguiente manejador en la cadena de ejecución.
   * @returns Observable con la respuesta procesada.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const { method, url, ip } = req;
    const now = Date.now();

    this.logger.log(`📥 [INCOMING] ${method} ${url} - IP: ${ip || 'local'}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = http.getResponse();
          const statusCode = res.statusCode;
          const delay = Date.now() - now;
          this.logger.log(
            `📤 [COMPLETED] ${method} ${url} - Status: ${statusCode} +${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          const status = error.status || 500;
          this.logger.error(
            `💥 [FAILED] ${method} ${url} - Status: ${status} - Error: ${error.message} +${delay}ms`,
          );
        },
      }),
    );
  }
}
