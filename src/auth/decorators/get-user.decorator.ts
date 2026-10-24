import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro personalizado para extraer el usuario autenticado desde el objeto Request.
 *
 * Propósito: Proveer acceso tipado y limpio a los datos del usuario autenticado en los controladores.
 * Ejemplo de uso: `@GetUser() user` o `@GetUser('email') email: string`
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
