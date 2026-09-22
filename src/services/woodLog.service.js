const calculateWoodLogValues = ({
  cft,
  girth,
  height,
  pricePerCft,
}) => {
  let finalCft;

  // Option 1: Direct CFT
  if (cft !== undefined && cft !== null) {
    if (girth !== undefined || height !== undefined) {
      throw new Error(
        "Provide either cft OR girth and height, not both"
      );
    }

    finalCft = Number(cft);
  }

  // Option 2: Calculate CFT from girth + height
  else if (girth !== undefined && height !== undefined) {
    finalCft = (Number(girth) * Number(girth) * Number(height)) / 2304;
  }

  // Neither provided
  else {
    throw new Error(
      "Either cft OR both girth and height are required"
    );
  }

  if (finalCft <= 0) {
    throw new Error("CFT must be greater than 0");
  }

  const totalPrice = finalCft * Number(pricePerCft);

  return {
    cft: finalCft,
    totalPrice,
  };
};

module.exports = {
  calculateWoodLogValues,
};