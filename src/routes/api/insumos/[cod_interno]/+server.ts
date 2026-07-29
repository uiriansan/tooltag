import { get_insumo_by_cod_interno } from "$lib/server/insumos";
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { RateLimiter } from "sveltekit-rate-limiter/server";

const limiter = new RateLimiter({
  IP: [25, "m"], // 25 requests por minuto por IP
});

export const GET: RequestHandler = async (event) => {
  if (await limiter.isLimited(event)) {
    error(429, "Aguarde um momento, ou tente novamente com um usuário logado.");
  }

  if (event.params.cod_interno) {
    if (
      /^[A-Z][0-9]{3}$/.test(event.params.cod_interno) ||
      /^[0-9]{6}$/.test(event.params.cod_interno)
    ) {
      const insumo = await get_insumo_by_cod_interno(event.params.cod_interno);
      return json(insumo, {
        status: insumo && insumo.length > 0 ? 200 : 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
  return json([], {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
