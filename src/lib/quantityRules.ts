import { ProductQuantityRule } from "@/types/database";

export interface QuantityValidationResult {
  isValid: boolean;
  message?: string;
  price?: number;
}

export function validateQuantity(
  quantity: number,
  rules?: ProductQuantityRule[]
): QuantityValidationResult {
  if (!rules || rules.length === 0) {
    return { isValid: true };
  }

  if (quantity <= 0) {
    return { isValid: false, message: "Quantidade deve ser maior que zero" };
  }

  // Ordena as regras por min_qty
  const sorted = [...rules].sort((a, b) => a.min_qty - b.min_qty);

  // 1. Procura faixa fixa exata
  const fixedRule = sorted.find(
    (rule) =>
      rule.price != null &&
      rule.min_qty <= quantity &&
      (rule.max_qty == null || quantity <= rule.max_qty)
  );
  if (fixedRule) {
    return {
      isValid: true,
      price: Number(fixedRule.price),
    };
  }

  // 2. Procura regra de adicional (extra_per_unit)
  const extraRule = sorted.find(
    (rule) => rule.extra_per_unit != null && quantity >= rule.min_qty
  );
  if (extraRule) {
    // Encontra a última faixa fixa anterior
    const lastFixed = [...sorted]
      .reverse()
      .find(
        (rule) =>
          rule.price != null &&
          rule.max_qty != null &&
          rule.max_qty < quantity
      );
    const basePrice = lastFixed ? Number(lastFixed.price) : 0;
    const baseQty = lastFixed ? lastFixed.max_qty! : extraRule.min_qty - 1;
    const additionalUnits = quantity - baseQty;
    const price =
      basePrice + additionalUnits * Number(extraRule.extra_per_unit);
    return {
      isValid: true,
      price,
    };
  }

  // Se não encontrou nenhuma regra aplicável
  return {
    isValid: false,
    message: `Quantidade mínima é ${sorted[0].min_qty} unidades`,
  };
} 