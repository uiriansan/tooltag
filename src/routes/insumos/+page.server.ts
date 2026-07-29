import { redirect } from "@sveltejs/kit";
import type { PageServerData } from "../$types";

// @ts-ignore
export const load: PageServerData = ({ params }) => {
  redirect(307, `/itens?insumos`);
};
