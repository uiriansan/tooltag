import { SortFerramentas, type FerramentaCardData } from "$lib/types";
import { offset } from "@popperjs/core";

export const ferramentas_cache = $state<{
  items: FerramentaCardData[];
  has_more: boolean;
  offset: number;
  debounce_query: string | null;
  count: number;
  url_params: string | null;
}>({
  items: [],
  has_more: true,
  offset: 0,
  debounce_query: null,
  count: 0,
  url_params: null,
});
