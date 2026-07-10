const SUGAR_TIER_G = 1000;

export function parseWeightGrams(variantSize, productName) {
    // Try variantSize first (e.g. "250g", "500g", "1kg")
    const sources = [variantSize, productName].filter(Boolean);
    for (const src of sources) {
        const s = src.toLowerCase();
        const kgMatch = s.match(/(\d+\.?\d*)\s*kg/);
        if (kgMatch) return parseFloat(kgMatch[1]) * 1000;
        const gMatch = s.match(/(\d+\.?\d*)\s*g(?:ram)?/);
        if (gMatch) return parseFloat(gMatch[1]);
    }
    return 0;
}

// Free sugar: 1 kg earned per full 1 kg of tea in cart, repeating
// (1 kg tea -> 1 kg sugar, 2 kg tea -> 2 kg sugar, ...).
export function getSugarOffer(items = []) {
    const totalWeightGrams = items.reduce(
        (sum, item) => sum + parseWeightGrams(item.variantSize || item.size, item.product?.name) * item.quantity,
        0
    );
    const sugarKg = Math.floor(totalWeightGrams / SUGAR_TIER_G);
    const nextMilestoneG = (sugarKg + 1) * SUGAR_TIER_G;
    const remainingG = Math.max(nextMilestoneG - totalWeightGrams, 0);
    const progressPct = ((totalWeightGrams - sugarKg * SUGAR_TIER_G) / SUGAR_TIER_G) * 100;

    return {
        totalWeightGrams,
        sugarKg,
        sugarWeightGrams: sugarKg * SUGAR_TIER_G,
        nextMilestoneG,
        remainingG,
        progressPct,
    };
}
