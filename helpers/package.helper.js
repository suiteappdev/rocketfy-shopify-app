const mapDimension = (lineItems) => {
    let item = {} ;

    if(lineItems.length == 1){
      return getDimensionFromWeight(lineItems[0])
    }

    lineItems.forEach(element => {
        item.height += element.height;
        item.weight += element.weight;
    });

    item.large = Math.max(lineItems.map((product) => product.large));
    item.width = Math.max(lineItems.map((product) => product.width));

    let dimension = getDimensionFromWeight(item);

    return dimension;
};

const getDimensionFromWeight = (lineItem)=>{
  let dimensions = {
    height: 0,
    width:0,
    large : 0,
    weight: lineItem.weight < 1 ? 1 : lineItem.weight,
  };

  if (calculateVolum(dimensions) / 6000 <= dimensions.weight) {
      return dimensions;
  }

  let factorDimensional = dimensions.weight * 6000;
  let large = factorDimensional / dimensions.height / dimensions.width;

  let calculoDimensiones = {
      weight: dimensions.weight,
      height: dimensions.height,
      width: dimensions.width,
      large: Math.floor(large)
  };

  return calculoDimensiones;
}

const calculateVolum = (dimension) => {
    return dimension.height * dimension.large * dimension.width;
};
  

export { mapDimension };