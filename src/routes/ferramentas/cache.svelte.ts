import { type Insumo, SortFerramentas } from "$lib/types";
import { offset } from "@popperjs/core";

export const ferramentas_cache = $state<{
  items: Insumo[];
  has_more: boolean;
  offset: number;
  debounce_query: string | null;
}>({
  items: [],
  has_more: true,
  offset: 0,
  debounce_query: null,
});
