import utils from '@bigcommerce/stencil-utils';

export async function getSku(productId, optionsList) {
  const authToken = window.BCData["csrf_token"];
  let formSerialized = `authenticity_token=${authToken}&action=add&product_id=${productId}`;

  const attributeData = optionsList.reduce((attrString, attr) => {
    return attrString + `&attribute[${attr.id}]=${attr.selected}`;
  }, "");

  formSerialized += attributeData + `&qty[]=1`;

  return new Promise((resolve) => {
    utils.api.productAttributes.optionChange(productId, formSerialized, [], (err, response) => {
      console.log(response);
      const productAttr = {
        sku: response.data.sku,
        stock: response.data.stock,
        in_stock_attributes: response.data.in_stock_attributes,
        price: response.data.price.without_tax.value,
      };
      resolve(productAttr);
    });
  });
}
