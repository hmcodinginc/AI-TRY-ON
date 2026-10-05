const isProductValidForDemo = (product) => {
  if (!product) return false;

  const genderStr = (product.gender || 'unknown').toLowerCase();
  
  // 1. Check strict gender field first.
  if (genderStr === 'women' || genderStr === 'female' || genderStr === 'girls') {
    return false;
  }
  
  if (genderStr === 'men' || genderStr === 'male' || genderStr === 'unisex') {
    return true; // Strongly trust the gender field
  }

  // 2. If gender is unknown, do a safe check on name/category
  const nameStr = (product.name || '').toLowerCase();
  const catStr = (product.category || '').toLowerCase();
  const womenKeywords = ['women', 'woman', 'female', 'ladies', 'girls', "women's"];
  const isWomens = womenKeywords.some(kw => 
    nameStr.includes(kw) || catStr.includes(kw)
  );
  if (isWomens) return false;

  // Assume valid if it hasn't matched a female keyword and isn't explicitly female
  return true;
};

module.exports = { isProductValidForDemo };
